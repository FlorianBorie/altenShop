import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Product } from '../../data-access/product.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnChanges {

  /** Produit TOUJOURS fourni par le parent */
  @Input({ required: true }) product!: Product;

  /** Événements */
  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;

  /** Options pour inventoryStatus */
  inventoryOptions = [
    { label: 'Non renseigné', value: null },
    { label: 'En stock', value: 'INSTOCK' },
    { label: 'Stock faible', value: 'LOWSTOCK' },
    { label: 'Rupture', value: 'OUTOFSTOCK' },
  ];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }
  
  /** Initialisation du formulaire */
  private initForm(): void {
    this.productForm = this.fb.group({
      id: [0],
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      image: [''],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      internalReference: [''],
      shellId: [0],
      inventoryStatus: [null, Validators.required],
      rating: [0],
      createdAt: [0],
      updatedAt: [0]
    });
  }

  /** Mise à jour du formulaire quand le produit change */
  ngOnChanges(): void {
    if (this.product) {
      // patchValue avec null si inventoryStatus est null
      this.productForm.patchValue({
        ...this.product,
        inventoryStatus: this.product.inventoryStatus ?? null
      });
    }
  }

  /** Soumission */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.productForm.getRawValue());
  }

  /** Annulation */
  onCancel(): void {
    this.cancel.emit();
  }
}