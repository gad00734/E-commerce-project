import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.css']
})
export class ProductModalComponent {
  @Input() product: Product | null = null;
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();

  onClose(): void {
    this.closeModal.emit();
  }

  onAddToCart(): void {
    if (this.product) {
      this.addToCart.emit(this.product);
    }
  }

  onAddToWishlist(): void {
    if (this.product) {
      this.addToWishlist.emit(this.product);
    }
  }
} 