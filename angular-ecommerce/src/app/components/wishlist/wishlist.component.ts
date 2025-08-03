import { Component, OnInit } from '@angular/core';
import { WishlistItem } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  searchQuery: string = '';
  filteredItems: WishlistItem[] = [];
  isLoggedIn = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadWishlist();
      }
    });
  }

  loadWishlist(): void {
    this.wishlistService.wishlist$.subscribe(wishlist => {
      this.wishlistItems = wishlist;
      this.filteredItems = [...this.wishlistItems];
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredItems = this.wishlistService.searchWishlist(this.searchQuery);
    } else {
      this.filteredItems = [...this.wishlistItems];
    }
  }

  addToCart(item: WishlistItem): void {
    if (!this.isLoggedIn) {
      this.showToast('Please login to add items to cart', 'warning');
      return;
    }

    const product = this.productService.getProductById(item.productId);
    if (product) {
      this.cartService.addToCart(product);
      this.showToast(`${item.name} added to cart`, 'success');
    } else {
      this.showToast('Product not found', 'error');
    }
  }

  removeFromWishlist(productId: string): void {
    if (!this.isLoggedIn) {
      this.showToast('Please login to manage wishlist', 'warning');
      return;
    }

    this.wishlistService.removeFromWishlist(productId);
    this.showToast('Item removed from wishlist', 'success');
  }

  clearWishlist(): void {
    if (!this.isLoggedIn) {
      this.showToast('Please login to manage wishlist', 'warning');
      return;
    }

    this.wishlistService.clearWishlist();
    this.showToast('Wishlist cleared', 'info');
  }

  private showToast(message: string, type: string = 'info'): void {
    // Toast implementation
    console.log(`${type}: ${message}`);
  }
} 