import { Component, OnInit } from '@angular/core';
import { Product, Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  isLoggedIn = false;
  selectedProduct: Product | null = null;
  showModal = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  loadProducts(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
      this.filterProducts();
    });
  }

  loadCategories(): void {
    this.productService.categories$.subscribe(categories => {
      this.categories = categories;
    });
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterProducts();
  }

  onSearch(): void {
    this.filterProducts();
  }

  onSortChange(): void {
    this.filterProducts();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === this.selectedCategory);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Sort products
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case 'price':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'newest':
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return products;
    }
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.sortBy = 'name';
    this.filterProducts();
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
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

  viewProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
  }

  private showToast(message: string, type: string = 'info'): void {
    // Toast implementation
    console.log(`${type}: ${message}`);
  }
} 