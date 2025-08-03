import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order, OrderStatus, OrderItem, StatusChange } from '../models/order.model';
import { CartItem } from '../models/product.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  
  private adminOrdersSubject = new BehaviorSubject<Order[]>([]);
  public adminOrders$ = this.adminOrdersSubject.asObservable();

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.loadOrders();
    this.loadAdminOrders(); // Initialize admin orders immediately
  }

  private loadOrders(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const ordersKey = `orders_${user.id}`;
      const ordersData = localStorage.getItem(ordersKey);
      const orders = ordersData ? JSON.parse(ordersData) : [];
      // Convert date strings back to Date objects
      const ordersWithDates = orders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        statusHistory: order.statusHistory ? order.statusHistory.map((change: any) => ({
          ...change,
          changedAt: new Date(change.changedAt)
        })) : []
      }));
      this.ordersSubject.next(ordersWithDates);
    }
  }

  loadAdminOrders(): void {
    console.log('OrderService: Loading admin orders');
    const allOrders = this.getAllOrders();
    console.log(`OrderService: Found ${allOrders.length} total orders for admin`);
    this.adminOrdersSubject.next(allOrders);
    console.log('OrderService: Admin orders loaded and notified');
  }

  private saveOrders(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const ordersKey = `orders_${user.id}`;
      localStorage.setItem(ordersKey, JSON.stringify(this.ordersSubject.value));
    }
  }

  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSubject.value.find(order => order.id === id);
  }

  createOrder(cartItems: CartItem[]): Order | null {
    console.log('OrderService: Creating order with', cartItems.length, 'items');
    
    const user = this.authService.getCurrentUser();
    if (!user || cartItems.length === 0) {
      console.log('OrderService: Cannot create order - no user or empty cart');
      return null;
    }

    const orderItems: OrderItem[] = cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + shipping;

    const order: Order = {
      id: this.generateOrderId(),
      userId: user.id,
      items: orderItems,
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [{
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.PENDING,
        changedAt: new Date(),
        changedBy: `${user.firstName} ${user.lastName}`,
        notes: 'Order created'
      }]
    };

    console.log('OrderService: Created order', order.id, 'for user', user.id);

    const orders = [...this.ordersSubject.value, order];
    this.ordersSubject.next(orders);
    this.saveOrders();

    // Clear cart after order creation
    this.cartService.clearCart();

    // Notify admin orders observable
    this.notifyOrdersUpdated();

    console.log('OrderService: Order created successfully');
    return order;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): void {
    console.log(`OrderService: Updating order ${orderId} to status ${newStatus}`);
    
    const currentUser = this.authService.getCurrentUser();
    const changedBy = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System';

    // Get all users to find which user has this order
    const users = this.getAllUsers();
    let orderUpdated = false;

    console.log(`OrderService: Checking ${users.length} users for order ${orderId}`);

    // Update the order in the correct user's storage
    users.forEach(user => {
      const ordersKey = `orders_${user.id}`;
      const ordersData = localStorage.getItem(ordersKey);
      if (ordersData) {
        const userOrders = JSON.parse(ordersData);
        const orderIndex = userOrders.findIndex((order: Order) => order.id === orderId);
        
        if (orderIndex !== -1) {
          console.log(`OrderService: Found order ${orderId} in user ${user.id}`);
          const order = userOrders[orderIndex];
          const statusChange: StatusChange = {
            fromStatus: order.status,
            toStatus: newStatus,
            changedAt: new Date(),
            changedBy: changedBy,
            notes: notes
          };

          const statusHistory = order.statusHistory || [];
          statusHistory.push(statusChange);

          userOrders[orderIndex] = {
            ...order,
            status: newStatus,
            updatedAt: new Date(),
            statusHistory: statusHistory
          };

          localStorage.setItem(ordersKey, JSON.stringify(userOrders));
          orderUpdated = true;
          console.log(`OrderService: Updated order ${orderId} status to ${newStatus}`);
        }
      }
    });

    // If the order was found and updated, also update the current user's orders if they have this order
    if (orderUpdated) {
      console.log(`OrderService: Order was updated, notifying subscribers`);
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const orders = this.ordersSubject.value.map(order => {
          if (order.id === orderId) {
            const statusChange: StatusChange = {
              fromStatus: order.status,
              toStatus: newStatus,
              changedAt: new Date(),
              changedBy: changedBy,
              notes: notes
            };

            const statusHistory = order.statusHistory || [];
            statusHistory.push(statusChange);

            return {
              ...order,
              status: newStatus,
              updatedAt: new Date(),
              statusHistory: statusHistory
            };
          }
          return order;
        });

        this.ordersSubject.next(orders);
        this.saveOrders();
      }
      
      // Notify all subscribers that orders have been updated globally
      this.notifyOrdersUpdated();
    } else {
      console.log(`OrderService: Order ${orderId} was not found in any user's orders`);
    }
  }

  private notifyOrdersUpdated(): void {
    console.log('OrderService: Notifying orders updated');
    // Update admin orders observable
    this.loadAdminOrders();
    
    // Update current user's orders if they have any
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadOrders();
    }
    console.log('OrderService: Orders update notification complete');
  }

  getAllOrders(): Order[] {
    // For admin: get all orders from all users
    const allOrders: Order[] = [];
    const users = this.getAllUsers();
    
    users.forEach(user => {
      const ordersKey = `orders_${user.id}`;
      const ordersData = localStorage.getItem(ordersKey);
      if (ordersData) {
        const userOrders = JSON.parse(ordersData);
        // Convert date strings back to Date objects
        const ordersWithDates = userOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          statusHistory: order.statusHistory ? order.statusHistory.map((change: any) => ({
            ...change,
            changedAt: new Date(change.changedAt)
          })) : []
        }));
        allOrders.push(...ordersWithDates);
      }
    });

    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.ordersSubject.value.filter(order => order.status === status);
  }

  private generateOrderId(): string {
    return 'ORD-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getAllUsers(): any[] {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
  }

  // Debug method to show all orders
  debugShowAllOrders(): void {
    console.log('=== DEBUG: All Orders ===');
    const allOrders = this.getAllOrders();
    console.log('Total orders found:', allOrders.length);
    allOrders.forEach(order => {
      console.log(`Order ${order.id}: Status=${order.status}, User=${order.userId}, Total=$${order.total}`);
    });
    console.log('=== END DEBUG ===');
  }

  // Debug method to clear all orders (for testing)
  debugClearAllOrders(): void {
    console.log('=== DEBUG: Clearing All Orders ===');
    const users = this.getAllUsers();
    users.forEach(user => {
      const ordersKey = `orders_${user.id}`;
      localStorage.removeItem(ordersKey);
      console.log(`Cleared orders for user ${user.id}`);
    });
    this.notifyOrdersUpdated();
    console.log('=== END DEBUG: All Orders Cleared ===');
  }
} 