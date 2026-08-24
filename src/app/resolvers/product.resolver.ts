import { inject, RESPONSE_INIT } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { tap } from 'rxjs';

import { Product } from '../models/product';
import { ProductService } from '../services/product.service';

export const productResolver: ResolveFn<Product | undefined> = (route) => {
  const productService = inject(ProductService);
  const responseInit = inject(RESPONSE_INIT, { optional: true });
  const slug = route.paramMap.get('slug') ?? '';

  return productService.getProductBySlug(slug).pipe(
    tap((product) => {
      if (!product && responseInit) {
        responseInit.status = 404;
      }
    }),
  );
};
