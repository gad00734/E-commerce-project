import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/product.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadCart();
  }

  private loadCart(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const cartKey = `cart_${user.id}`;
      const cartData = localStorage.getItem(cartKey);
      const cart = cartData ? JSON.parse(cartData) : [];
      this.cartSubject.next(cart);
    }
  }

  private saveCart(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const cartKey = `cart_${user.id}`;
      localStorage.setItem(cartKey, JSON.stringify(this.cartSubject.value));
    }
  }

  getCart(): CartItem[] {
    return this.cartSubject.value;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const cart = this.cartSubject.value;
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        quantity: quantity,
        price: product.price,
        name: product.name,
        image: product.image
      });
    }

    this.cartSubject.next(cart);
    this.saveCart();
  }

  removeFromCart(productId: string): void {
    const cart = this.cartSubject.value.filter(item => item.productId !== productId);
    this.cartSubject.next(cart);
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    const cart = this.cartSubject.value.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    this.cartSubject.next(cart);
    this.saveCart();
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.saveCart();
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cartSubject.value.reduce((count, item) => count + item.quantity, 0);
  }

  getCartItem(productId: string): CartItem | undefined {
    return this.cartSubject.value.find(item => item.productId === productId);
  }

  isInCart(productId: string): boolean {
    return this.cartSubject.value.some(item => item.productId === productId);
  }
} 