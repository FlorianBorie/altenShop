// product-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PanierService } from 'app/panier/panier.service';
import { Product } from '../../data-access/product.model';
import { ProductService } from '../../../services/product.service';
import { ProductFormComponent } from 'app/products/ui/product-form/product-form.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';

const emptyProduct: Product = {
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
  inventoryStatus: 'INSTOCK',
  rating: 0,
  createdAt: 0,
  updatedAt: 0,
};

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [DataViewModule, CardModule, ButtonModule, DialogModule, ProductFormComponent, CommonModule],
})
export class ProductListComponent {
  showForm = false;
  selectedProduct: Product | null = null;
  private readonly productService = inject(ProductService);
  private readonly panierService = inject(PanierService);

  public readonly products = signal<Product[]>([]);
  public isDialogVisible = false;
  public isCreation = false;
  public readonly editedProduct = signal<Product>(emptyProduct);

  constructor() {
    // Charger les produits depuis le backend
    this.loadProducts();
  }

  private loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => {
      const mapped = data.map(p => ({
        ...emptyProduct,
        id: p.id ?? 0,  // 0 par défaut si undefined
        name: p.name,
        price: p.price
      }));
      this.products.set(mapped);
    },
    error: (err) => console.error(err)
  });
  }

  public onCreate() {
    this.isCreation = true;
    this.isDialogVisible = true;
    this.editedProduct.set(emptyProduct);
  }

  public onUpdate(product: Product) {
    this.isCreation = false;
    this.isDialogVisible = true;
    this.editedProduct.set(product);
  }

  public onDelete(product: Product) {
    if (!product.id) return;
    this.productService.delete(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Erreur suppression produit', err),
    });
  }

  public onSave(product: Product) {
    if (this.isCreation) {
      this.productService.create(product).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('Erreur création produit', err),
      });
    } else {
      this.productService.update(product.id!, product).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('Erreur mise à jour produit', err),
      });
    }
    this.closeDialog();
  }

  public onCancel() {
    this.closeDialog();
  }

  private closeDialog() {
    this.isDialogVisible = false;
  }

  public addToPanier(product: Product) {
    this.panierService.addToPanier(product);
  }

  public trackById(index: number, product: Product): number {
    return product.id;
  }

  newProduct() {
    this.selectedProduct = null;  // on n'a pas de produit sélectionné
    this.showForm = true;          // afficher le formulaire
  }
}
