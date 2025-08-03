import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  
  public products$ = this.productsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(): void {
    const productsData = localStorage.getItem('products');
    const products = productsData ? JSON.parse(productsData) : this.getDefaultProducts();
    this.productsSubject.next(products);
  }

  private loadCategories(): void {
    const categoriesData = localStorage.getItem('categories');
    const categories = categoriesData ? JSON.parse(categoriesData) : this.getDefaultCategories();
    this.categoriesSubject.next(categories);
  }

  getProducts(): Product[] {
    return this.productsSubject.value;
  }

  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  getProductById(id: string): Product | undefined {
    return this.productsSubject.value.find(p => p.id === id);
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.productsSubject.value.filter(p => p.category === categoryId);
  }

  searchProducts(query: string): Product[] {
    const products = this.productsSubject.value;
    return products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const products = [...this.productsSubject.value, newProduct];
    this.productsSubject.next(products);
    localStorage.setItem('products', JSON.stringify(products));
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.productsSubject.value.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    this.productsSubject.next(products);
    localStorage.setItem('products', JSON.stringify(products));
  }

  deleteProduct(id: string): void {
    const products = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(products);
    localStorage.setItem('products', JSON.stringify(products));
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt'>): void {
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
      createdAt: new Date()
    };

    const categories = [...this.categoriesSubject.value, newCategory];
    this.categoriesSubject.next(categories);
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    const categories = this.categoriesSubject.value.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    this.categoriesSubject.next(categories);
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  deleteCategory(id: string): void {
    const categories = this.categoriesSubject.value.filter(c => c.id !== id);
    this.categoriesSubject.next(categories);
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'iPhone 13 Pro',
        description: 'Latest iPhone with advanced camera system',
        price: 999,
        stock: 50,
        category: 'electronics',
        image: 'https://via.placeholder.com/300x200?text=iPhone+13+Pro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Samsung Galaxy S21',
        description: 'Premium Android smartphone',
        price: 899,
        stock: 30,
        category: 'electronics',
        image: 'https://via.placeholder.com/300x200?text=Samsung+S21',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'MacBook Pro',
        description: 'Professional laptop for developers',
        price: 1299,
        stock: 20,
        category: 'electronics',
        image: 'https://via.placeholder.com/300x200?text=MacBook+Pro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        price: 120,
        stock: 100,
        category: 'clothing',
        image: 'https://via.placeholder.com/300x200?text=Nike+Air+Max',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Adidas T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 25,
        stock: 200,
        category: 'clothing',
        image: 'https://via.placeholder.com/300x200?text=Adidas+T-Shirt',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getDefaultCategories(): Category[] {
    return [
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        createdAt: new Date()
      },
      {
        id: 'clothing',
        name: 'Clothing',
        description: 'Fashion and apparel',
        createdAt: new Date()
      }
    ];
  }
} 