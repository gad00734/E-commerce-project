import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  totalProducts = 0;
  totalOrders = 0;
  totalUsers = 0;
  totalCategories = 0;
  totalRevenue = 0;
  recentOrders: any[] = [];
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadDashboardData();
  }

  checkAdminAccess(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin) {
        this.router.navigate(['/']);
      }
    });
  }

  loadDashboardData(): void {
    // Load products count
    this.productService.products$.subscribe(products => {
      this.totalProducts = products.length;
    });

    // Load orders count and recent orders - use admin orders for admin dashboard
    this.orderService.adminOrders$.subscribe(orders => {
      this.totalOrders = orders.length;
      this.recentOrders = orders.slice(0, 5); // Get 5 most recent orders
      
      // Calculate total revenue from delivered orders
      this.totalRevenue = orders
        .filter(order => order.status === OrderStatus.DELIVERED)
        .reduce((total, order) => total + order.total, 0);
    });

    // Load users count
    this.loadUsersCount();
    
    // Load categories count
    this.loadCategoriesCount();
  }

  private loadUsersCount(): void {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      this.totalUsers = users.length;
    }
  }

  private loadCategoriesCount(): void {
    const categoriesData = localStorage.getItem('categories');
    if (categoriesData) {
      const categories = JSON.parse(categoriesData);
      this.totalCategories = categories.length;
    } else {
      this.totalCategories = 0;
    }
  }

  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
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
} 