import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements  OnInit, OnChanges {
  
  @Output() save = new EventEmitter<Product>();
  @Input() product?: Product;
  productForm!: FormGroup;
  isEditMode = false;

ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.productForm) {
      this.productForm.patchValue({
        code: this.product?.code || '',
        name: this.product?.name || '',
        description: this.product?.description || '',
        image: this.product?.image || '',
        category: this.product?.category || '',
        price: this.product?.price || 0,
        quantity: this.product?.quantity || 0,
        internalReference: this.product?.internalReference || '',
        shellId: this.product?.shellId || 0,
        inventoryStatus: this.product?.inventoryStatus || 'INSTOCK',
        rating: this.product?.rating || 0,
        createdAt: this.product?.createdAt || Date.now(),
        updatedAt: Date.now()
      });
      this.isEditMode = !!this.product;
    }
  }

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    this.isEditMode = !!this.product;

    this.productForm = this.fb.group({
      code: [this.product?.code || '', Validators.required],
      name: [this.product?.name || '', Validators.required],
      description: [this.product?.description || '', Validators.required],
      image: [this.product?.image || ''],
      category: [this.product?.category || '', Validators.required],
      price: [this.product?.price || 0, [Validators.required, Validators.min(0)]],
      quantity: [this.product?.quantity || 0, Validators.required],
      internalReference: [this.product?.internalReference || ''],
      shellId: [this.product?.shellId || 0],
      inventoryStatus: [this.product?.inventoryStatus || 'INSTOCK'],
      rating: [this.product?.rating || 0],
      createdAt: [this.product?.createdAt || Date.now()],
      updatedAt: [Date.now()]
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const formValue: Product = this.productForm.value;
    this.save.emit(formValue);
    if (this.isEditMode && this.product?.id) {
      // Mode édition
      this.productService.update(this.product.id, formValue).subscribe({
        next: () => console.log('Produit mis à jour avec succès'),
        error: (err) => console.error('Erreur update :', err)
      });
    } else {
      // Mode ajout
      this.productService.create(formValue).subscribe({
        next: () => console.log('Produit ajouté avec succès'),
        error: (err) => console.error('Erreur création :', err)
      });
    }
  }
}