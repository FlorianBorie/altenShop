import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../products/data-access/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:8000/products';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private normalizeInventoryStatus(product: any): Product {
    return {
      ...product,
      inventoryStatus: product.inventoryStatus as 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK' | null
    };
  }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      map(products => products.map(p => this.normalizeInventoryStatus(p)))
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(
      map(p => this.normalizeInventoryStatus(p))
    );
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(
      this.baseUrl,
      this.cleanProduct(product),
      { headers: this.getAuthHeaders() }
    );
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(
      `${this.baseUrl}/${id}`,
      this.cleanProduct(product),
      { headers: this.getAuthHeaders() }
    ).pipe(map(p => this.normalizeInventoryStatus(p)));
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'  // <- important
    });
  }

  private cleanProduct(product: Product) {
    const p: any = { ...product };
    delete p.createdAt;
    delete p.updatedAt;
    return p;
  }
}