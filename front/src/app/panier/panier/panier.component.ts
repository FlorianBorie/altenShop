import { Component } from '@angular/core';
import {PanierService} from '../panier.service';

import { Product } from '../../products/data-access/product.model';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './panier.component.html',
  styleUrl: './panier.component.css'
})
export class PanierComponent {
  panierItems: Product[] = [];

  removeFromPanier(productId: number) {
    this.panierService.removeFromPanier(productId);
    console.log(`supp: ${productId}`);
  }
  constructor(private readonly panierService: PanierService) {
    this.panierService.panier$.subscribe(products => {
      this.panierItems = products
    });
  }
}
