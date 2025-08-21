import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Product } from '../services/product.service';

@Injectable({
  providedIn: 'root',
})
export class PanierService {
  private readonly _panier = new BehaviorSubject<Product[]>([]);
  get panier$(): Observable<Product[]> {
    return this._panier.asObservable();
  }

  constructor() {}

  addToPanier(product: Product) {
    const panierCopy = [...this._panier.value];
    const itemExistant = panierCopy.find(p => p.id === product.id);

    if (itemExistant) {
      itemExistant.quantity += 1;
    } else {
      panierCopy.push({ ...product, quantity: 1 });
    }
    this._panier.next(panierCopy);
    console.log('Nouveau panier :', this._panier.value)
  }

  removeFromPanier(productId: number) {
    const updatedPanier = [...this._panier.value];
    const itemExistant = updatedPanier.find(p => p.id === productId);

    if (itemExistant) {
      if (itemExistant.quantity > 1) {
        itemExistant.quantity -= 1;
      } else {
        const index = updatedPanier.findIndex(p => p.id === productId);
        updatedPanier.splice(index, 1);
      }
    }
    this._panier.next(updatedPanier);
  }

  getPanierItems() {
    return this._panier.value;
  }

  getTotalQuantityPanier(): Observable<number> {
    return this._panier.asObservable().pipe(
      map(p => {
        return p.reduce((total, product) => total + product.quantity, 0);
      })
    );
  }
}