import { Component, inject, input, effect, computed } from '@angular/core';
import { EcommerceStore } from '../../ecommerce-store';
import { ProductInfo } from './product-info/product-info';
import { ViewReviews } from "./view-reviews/view-reviews";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Product } from '../../models/product';
@Component({
  selector: 'app-view-product-detail',
  standalone: true,
  imports: [RouterLink, ProductInfo, ViewReviews],
  template: `
    <div class="product-detail-page mx-auto max-w-[1200px] py-6">

     <a
  [routerLink]="backRoute()"
  class="text-blue-600"
>
  ← Continue Shopping
</a>

      @if (product(); as product) {
        <div class="product-detail-layout flex gap-8 mb-8">
          <img 
            [src]="product.imageUrl" 
            [alt]="product.name"
            class="product-detail-image w-[500px] h-[500px] object-cover rounded-lg" 
            [style.view-transition-name]="'product-image-' + product.id"
          />
          <div class="flex-1">
            <app-product-info [product]="product" />
          </div>
        </div>
        <app-view-reviews [product]="product"/>
      } @else {
        <main class="py-16">
          <h1 class="text-2xl font-extrabold mb-3">Товар не найден</h1>
          <p class="text-gray-600 mb-6">Проверьте адрес страницы или вернитесь в каталог.</p>
          <a routerLink="/products/all" class="text-blue-600">Открыть каталог</a>
        </main>
      }

    </div>
  `,
})
export default class ViewProductDetail {
 slug = input.required<string>();
  store = inject(EcommerceStore);
  private readonly route = inject(ActivatedRoute);
  private readonly resolvedProduct = toSignal(
    this.route.data.pipe(map((data) => data['product'] as Product | undefined)),
    { initialValue: this.route.snapshot.data['product'] as Product | undefined },
  );
  product = computed(() =>
    this.resolvedProduct() ?? this.store.products().find((p) => p.slug === this.slug())
  );

constructor() {
  effect(() => {
    const product = this.product();

    if (!product) {
      return;
    }

    this.store.setProductId(product.id);
    this.store.upsertProduct(product);
    this.store.setProductSeoTags(product);
  });
}

  backRoute = computed(() => `/products/${this.product()?.categorySlug || this.store.category() || 'all'}`);
}
