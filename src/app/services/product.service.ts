import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  constructor() {}

  /**
   * Получить все товары
   */
 getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>('/data/products.json');
}

  /**
   * Получить товар по slug
   */
  getProductBySlug(slug: string): Observable<Product | undefined> {
    return new Observable<Product | undefined>((observer) => {
      this.getProducts().subscribe({
        next: (products) => {
          observer.next(products.find((p) => p.slug === slug));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * Получить товар по id
   */
  getProductById(id: string): Observable<Product | undefined> {
    return new Observable<Product | undefined>((observer) => {
      this.getProducts().subscribe({
        next: (products) => {
          observer.next(products.find((p) => p.id === id));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}