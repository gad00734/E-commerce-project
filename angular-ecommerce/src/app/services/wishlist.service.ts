import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WishlistItem } from '../models/product.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const wishlistKey = `wishlist_${user.id}`;
      const wishlistData = localStorage.getItem(wishlistKey);
      const wishlist = wishlistData ? JSON.parse(wishlistData) : [];
      this.wishlistSubject.next(wishlist);
    }
  }

  private saveWishlist(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const wishlistKey = `wishlist_${user.id}`;
      localStorage.setItem(wishlistKey, JSON.stringify(this.wishlistSubject.value));
    }
  }

  getWishlist(): WishlistItem[] {
    return this.wishlistSubject.value;
  }

  addToWishlist(product: Product): void {
    const wishlist = this.wishlistSubject.value;
    const existingItem = wishlist.find(item => item.productId === product.id);

    if (!existingItem) {
      wishlist.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        addedAt: new Date()
      });

      this.wishlistSubject.next(wishlist);
      this.saveWishlist();
    }
  }

  removeFromWishlist(productId: string): void {
    const wishlist = this.wishlistSubject.value.filter(item => item.productId !== productId);
    this.wishlistSubject.next(wishlist);
    this.saveWishlist();
  }

  clearWishlist(): void {
    this.wishlistSubject.next([]);
    this.saveWishlist();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistSubject.value.some(item => item.productId === productId);
  }

  getWishlistItem(productId: string): WishlistItem | undefined {
    return this.wishlistSubject.value.find(item => item.productId === productId);
  }

  searchWishlist(query: string): WishlistItem[] {
    const wishlist = this.wishlistSubject.value;
    return wishlist.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }
} 