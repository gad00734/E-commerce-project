import { Component, OnInit } from '@angular/core';
import { Product, Category } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedProduct: Product | null = null;
  showModal = false;
  isEditing = false;
  isAdmin = false;

  productForm = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image: ''
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadProducts();
    this.loadCategories();
  }

  checkAdminAccess(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin) {
        this.router.navigate(['/']);
      }
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

  addProduct(): void {
    this.isEditing = false;
    this.resetForm();
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.selectedProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image
    };
    this.showModal = true;
  }

  saveProduct(): void {
    if (this.isEditing && this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct.id, this.productForm);
    } else {
      this.productService.addProduct(this.productForm);
    }
    
    this.closeModal();
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      image: ''
    };
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }
} 