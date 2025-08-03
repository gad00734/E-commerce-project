import { Component, OnInit } from '@angular/core';
import { Product, Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';
  isLoggedIn = false;
  isAdmin = false;
  selectedProduct: Product | null = null;
  showModal = false;
  showCartModal = false;
  showOrdersModal = false;
  showProfileModal = false;
  showAdminModal = false;
  cartItems: any[] = [];
  wishlistItems: any[] = [];
  recentOrders: any[] = [];
  currentUser: any = null;
  activeTab: string = 'products';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadUserData();
    this.loadCart();
    this.loadWishlist();
    this.loadRecentOrders();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.currentUser = user;
    });
  }

  loadProducts(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
    });
  }

  loadCategories(): void {
    this.productService.categories$.subscribe(categories => {
      this.categories = categories;
    });
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  loadWishlist(): void {
    this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  loadRecentOrders(): void {
    if (this.isLoggedIn) {
      this.orderService.orders$.subscribe(orders => {
        this.recentOrders = orders.slice(0, 5);
      });
    }
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    if (categoryId) {
      this.products = this.productService.getProductsByCategory(categoryId);
    } else {
      this.loadProducts();
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.products = this.productService.searchProducts(this.searchQuery);
    } else {
      this.loadProducts();
    }
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) {
      this.showToast('Please login to add items to cart', 'warning');
      return;
    }
    
    this.cartService.addToCart(product);
    this.showToast(`${product.name} added to cart`, 'success');
  }

  addToWishlist(product: Product): void {
    if (!this.isLoggedIn) {
      this.showToast('Please login to add items to wishlist', 'warning');
      return;
    }
    
    this.wishlistService.addToWishlist(product);
    this.showToast(`${product.name} added to wishlist`, 'success');
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.showToast('Item removed from cart', 'success');
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId);
    this.showToast('Item removed from wishlist', 'success');
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      this.showToast('Cart is empty', 'warning');
      return;
    }
    
    const order = this.orderService.createOrder(this.cartItems);
    if (order) {
      this.showToast('Order placed successfully!', 'success');
      this.closeCartModal();
      this.loadRecentOrders();
    } else {
      this.showToast('Failed to create order', 'error');
    }
  }

  viewProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  openCartModal(): void {
    this.showCartModal = true;
  }

  closeCartModal(): void {
    this.showCartModal = false;
  }

  openOrdersModal(): void {
    this.showOrdersModal = true;
  }

  closeOrdersModal(): void {
    this.showOrdersModal = false;
  }

  openProfileModal(): void {
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  openAdminModal(): void {
    this.showAdminModal = true;
  }

  closeAdminModal(): void {
    this.showAdminModal = false;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.showToast('Logged out successfully', 'success');
    this.closeProfileModal();
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  private showToast(message: string, type: string = 'info'): void {
    // Toast implementation
    console.log(`${type}: ${message}`);
  }
} 