import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order, OrderStatus, StatusChange } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  showModal = false;
  isAdmin = false;
  selectedStatus: OrderStatus | null = null;
  searchQuery: string = '';
  private ordersSubscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  checkAdminAccess(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin) {
        this.router.navigate(['/']);
      }
    });
  }

  loadOrders(): void {
    console.log('AdminOrdersComponent: Loading orders');
    // Load orders immediately
    this.orders = this.orderService.getAllOrders();
    console.log(`AdminOrdersComponent: Initially loaded ${this.orders.length} orders`);
    console.log('AdminOrdersComponent: Orders:', this.orders);
    
    // Subscribe to admin orders observable for real-time updates
    this.ordersSubscription = this.orderService.adminOrders$.subscribe(orders => {
      console.log(`AdminOrdersComponent: Received ${orders.length} orders from observable`);
      this.orders = orders;
      console.log('AdminOrdersComponent: Updated orders:', this.orders);
    });
  }

  refreshOrders(): void {
    console.log('AdminOrdersComponent: Refreshing orders');
    // Force a refresh by reloading all orders
    this.orderService.loadAdminOrders();
    console.log('AdminOrdersComponent: Orders refresh complete');
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showModal = true;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
    
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      alert('Order not found!');
      return;
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, newStatus)) {
      alert(`Invalid status transition from ${order.status} to ${newStatus}`);
      return;
    }

    // Additional validation for specific transitions
    if (newStatus === OrderStatus.SHIPPED && order.status !== OrderStatus.PROCESSING) {
      alert('Orders can only be shipped after being processed!');
      return;
    }

    if (newStatus === OrderStatus.DELIVERED && order.status !== OrderStatus.SHIPPED) {
      alert('Orders can only be delivered after being shipped!');
      return;
    }

    console.log(`Calling orderService.updateOrderStatus for order ${orderId}`);
    this.orderService.updateOrderStatus(orderId, newStatus);
    console.log('Order status updated, refreshing orders...');
    this.refreshOrders();
  }

  acceptOrder(orderId: string): void {
    console.log(`Accepting order ${orderId}`);
    const order = this.orders.find(o => o.id === orderId);
    console.log(`Found order:`, order);
    if (order && order.status === OrderStatus.PENDING) {
      console.log(`Order ${orderId} is pending, updating to processing`);
      this.updateOrderStatus(orderId, OrderStatus.PROCESSING);
    } else {
      console.log(`Order ${orderId} cannot be accepted. Status: ${order?.status}`);
      alert('Only pending orders can be accepted!');
    }
  }

  shipOrder(orderId: string): void {
    console.log(`Shipping order ${orderId}`);
    const order = this.orders.find(o => o.id === orderId);
    console.log(`Found order:`, order);
    if (order && order.status === OrderStatus.PROCESSING) {
      console.log(`Order ${orderId} is processing, updating to shipped`);
      this.updateOrderStatus(orderId, OrderStatus.SHIPPED);
    } else {
      console.log(`Order ${orderId} cannot be shipped. Status: ${order?.status}`);
      alert('Only processing orders can be shipped!');
    }
  }

  deliverOrder(orderId: string): void {
    console.log(`Delivering order ${orderId}`);
    const order = this.orders.find(o => o.id === orderId);
    console.log(`Found order:`, order);
    if (order && order.status === OrderStatus.SHIPPED) {
      console.log(`Order ${orderId} is shipped, updating to delivered`);
      this.updateOrderStatus(orderId, OrderStatus.DELIVERED);
    } else {
      console.log(`Order ${orderId} cannot be delivered. Status: ${order?.status}`);
      alert('Only shipped orders can be delivered!');
    }
  }

  cancelOrder(orderId: string): void {
    console.log(`Cancelling order ${orderId}`);
    const order = this.orders.find(o => o.id === orderId);
    console.log(`Found order:`, order);
    if (order && order.status === OrderStatus.DELIVERED) {
      console.log(`Order ${orderId} is delivered, cannot cancel`);
      alert('Delivered orders cannot be cancelled!');
      return;
    }
    
    if (order && order.status === OrderStatus.CANCELLED) {
      console.log(`Order ${orderId} is already cancelled`);
      alert('Order is already cancelled!');
      return;
    }
    
    if (confirm('Are you sure you want to cancel this order?')) {
      console.log(`Cancelling order ${orderId}`);
      this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
  }

  // Validate status transitions
  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    console.log(`Validating transition from ${currentStatus} to ${newStatus}`);
    
    const validTransitions: { [key: string]: OrderStatus[] } = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [], // Final status - no further transitions
      [OrderStatus.CANCELLED]: [] // Final status - no further transitions
    };

    const isValid = validTransitions[currentStatus]?.includes(newStatus) || false;
    console.log(`Transition validation result: ${isValid}`);
    return isValid;
  }

  // Get available actions for an order
  getAvailableActions(order: Order): string[] {
    const actions: string[] = [];
    
    switch (order.status) {
      case OrderStatus.PENDING:
        actions.push('Accept', 'Cancel');
        break;
      case OrderStatus.PROCESSING:
        actions.push('Ship', 'Cancel');
        break;
      case OrderStatus.SHIPPED:
        actions.push('Deliver', 'Cancel');
        break;
      case OrderStatus.DELIVERED:
        actions.push('View Details'); // No further actions
        break;
      case OrderStatus.CANCELLED:
        actions.push('View Details'); // No further actions
        break;
    }
    
    return actions;
  }

  // Check if action is available for an order
  canPerformAction(order: Order, action: string): boolean {
    const availableActions = this.getAvailableActions(order);
    return availableActions.includes(action);
  }

  // Get status history for an order
  getStatusHistory(order: Order): StatusChange[] {
    return order.statusHistory || [];
  }

  // Format status history for display
  formatStatusHistory(history: StatusChange[]): string {
    if (!history || history.length === 0) {
      return 'No status changes recorded';
    }

    return history.map(change => 
      `${change.fromStatus} → ${change.toStatus} by ${change.changedBy} on ${new Date(change.changedAt).toLocaleString()}`
    ).join('\n');
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrder = null;
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-warning';
      case OrderStatus.PROCESSING:
        return 'bg-info';
      case OrderStatus.SHIPPED:
        return 'bg-primary';
      case OrderStatus.DELIVERED:
        return 'bg-success';
      case OrderStatus.CANCELLED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusDisplay(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bi-clock';
      case OrderStatus.PROCESSING:
        return 'bi-gear';
      case OrderStatus.SHIPPED:
        return 'bi-truck';
      case OrderStatus.DELIVERED:
        return 'bi-check-circle';
      case OrderStatus.CANCELLED:
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getOrderStatuses(): OrderStatus[] {
    return Object.values(OrderStatus);
  }

  filterOrders(): Order[] {
    console.log(`FilterOrders: Total orders: ${this.orders.length}, Selected status: ${this.selectedStatus}, Search query: "${this.searchQuery}"`);
    
    let filtered = this.orders;
    
    if (this.selectedStatus !== null) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
      console.log(`After status filter: ${filtered.length} orders`);
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.userId.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
      console.log(`After search filter: ${filtered.length} orders`);
    }
    
    console.log(`FilterOrders: Returning ${filtered.length} orders`);
    return filtered;
  }

  getOrdersCount(): number {
    return this.orders.length;
  }

  getPendingOrdersCount(): number {
    return this.orders.filter(order => order.status === OrderStatus.PENDING).length;
  }

  getProcessingOrdersCount(): number {
    return this.orders.filter(order => order.status === OrderStatus.PROCESSING).length;
  }

  getShippedOrdersCount(): number {
    return this.orders.filter(order => order.status === OrderStatus.SHIPPED).length;
  }

  getDeliveredOrdersCount(): number {
    return this.orders.filter(order => order.status === OrderStatus.DELIVERED).length;
  }

  getTotalRevenue(): number {
    return this.orders
      .filter(order => order.status === OrderStatus.DELIVERED)
      .reduce((total, order) => total + order.total, 0);
  }

  debugOrders(): void {
    this.orderService.debugShowAllOrders();
  }

  createTestOrder(): void {
    console.log('Creating test order...');
    const testCartItems = [
      {
        productId: 'test-1',
        name: 'Test Product 1',
        price: 99.99,
        quantity: 2,
        image: 'assets/images/placeholder.png'
      }
    ];
    
    const order = this.orderService.createOrder(testCartItems);
    if (order) {
      console.log('Test order created:', order.id);
      this.refreshOrders();
    } else {
      console.log('Failed to create test order');
    }
  }

  clearAllOrders(): void {
    if (confirm('Are you sure you want to clear all orders? This is for testing purposes only.')) {
      this.orderService.debugClearAllOrders();
      this.refreshOrders();
    }
  }
} 