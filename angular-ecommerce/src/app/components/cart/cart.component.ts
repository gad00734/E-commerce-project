import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;
  isLoggedIn = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartItems = cart;
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.shipping = this.subtotal >= 1000 ? 0 : 50;
    this.total = this.subtotal + this.shipping;
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.showToast('Item removed from cart', 'success');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.showToast('Cart cleared', 'info');
  }

  checkout(): void {
    if (!this.isLoggedIn) {
      this.showToast('Please login to checkout', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems.length === 0) {
      this.showToast('Cart is empty', 'warning');
      return;
    }

    const order = this.orderService.createOrder(this.cartItems);
    if (order) {
      this.showToast('Order placed successfully!', 'success');
      this.router.navigate(['/orders']);
    } else {
      this.showToast('Failed to create order', 'error');
    }
  }

  private showToast(message: string, type: string = 'info'): void {
    // Toast implementation
    console.log(`${type}: ${message}`);
  }
} 