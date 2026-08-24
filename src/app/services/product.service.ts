import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly products$ = this.http.get<Product[]>('/data/products.json', { transferCache: false }).pipe(
    shareReplay({ bufferSize: 1, refCount: false }),
  );
  private readonly productsBySlug$ = this.products$.pipe(
    map((products) => new Map(products.map((product) => [product.slug, product]))),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
  private readonly productsById$ = this.products$.pipe(
    map((products) => new Map(products.map((product) => [product.id, product]))),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  constructor() {}

  /**
   * Получить все товары
   */
 getProducts(): Observable<Product[]> {
  return this.products$;
}

  /**
   * Получить товар по slug
   */
  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.productsBySlug$.pipe(map((productsBySlug) => productsBySlug.get(slug)));
  }

  /**
   * Получить товар по id
   */
  getProductById(id: string): Observable<Product | undefined> {
    return this.productsById$.pipe(map((productsById) => productsById.get(id)));
  }

  getRidanProducts(): Observable<Product[]> {
    return this.products$.pipe(
      map((products) =>
        products.filter((product) =>
          [product.name, product.description, product.series, product.category, product.subcategory]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .match(/ридан|ridan/),
        ),
      ),
    );
  }
}
