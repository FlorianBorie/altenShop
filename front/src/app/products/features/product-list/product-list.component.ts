import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Product } from '../../data-access/product.model';
import { ProductService } from '../../../services/product.service';
import { PanierService } from 'app/panier/panier.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProductFormComponent } from '../../ui/product-form/product-form.component';

const EMPTY_PRODUCT: Product = {
  id: 0,
  code: '',
  name: '',
  description: '',
  image: '',
  category: '',
  price: 0,
  quantity: 0,
  internalReference: '',
  shellId: 0,
  inventoryStatus: null,
  rating: 0,
  createdAt: 0,
  updatedAt: 0,
};

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DialogModule,
    ProductFormComponent
  ]
})
export class ProductListComponent {

  private readonly productService = inject(ProductService);
  private readonly panierService = inject(PanierService);

  readonly products = signal<Product[]>([]);
  readonly editedProduct = signal<Product>(EMPTY_PRODUCT);

  isDialogVisible = false;
  isCreation = false;

  constructor() {
    this.loadProducts();
  }

  private loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: console.error
    });
  }

  trackById(_: number, product: Product) {
    return product.id;
  }

  onCreate() {
    this.isCreation = true;
    this.editedProduct.set({ ...EMPTY_PRODUCT });
    this.isDialogVisible = true;
  }

  onUpdate(product: Product) {
    this.isCreation = false;
    this.editedProduct.set({ ...product });
    this.isDialogVisible = true;
  }

  onDelete(product: Product) {
    this.productService.delete(product.id).subscribe(() => {
      this.loadProducts();
    });
  }

  onSave(product: Product) {
    const request$ = this.isCreation
      ? this.productService.create(product)
      : this.productService.update(product.id, product);

    request$.subscribe(() => {
      this.loadProducts();
      this.isDialogVisible = false;
    });
  }

  addToPanier(product: Product) {
    this.panierService.addToPanier(product);
  }
}