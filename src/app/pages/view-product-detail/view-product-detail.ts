import { Component, inject, input, effect, computed } from '@angular/core';
import { EcommerceStore } from '../../ecommerce-store';
import { BackButton } from '../../components/back-button/back-button';
import { ProductInfo } from './product-info/product-info';
import { ViewReviews } from "./view-reviews/view-reviews";
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-view-product-detail',
  standalone: true,
  imports: [RouterLink, ProductInfo, ViewReviews],
  template: `
    <div class="mx-auto max-w-[1200px] py-6">

     <a
  [routerLink]="backRoute()"
  class="text-blue-600"
>
  ← Continue Shopping
</a>

      @if (product(); as product) {
        <div class="flex gap-8 mb-8">
          <img 
            [src]="product.imageUrl" 
            class="w-[500px] h-[500px] object-cover rounded-lg" 
            [style.view-transition-name]="'product-image-' + product.id"
          />
          <div class="flex-1">
            <app-product-info [product]="product" />
          </div>
        </div>
        <app-view-reviews [product]="product"/>
      }

    </div>
  `,
})
export default class ViewProductDetail {
 slug = input.required<string>();
  store = inject(EcommerceStore);
  product = computed(() =>
    this.store.products().find((p) => p.slug === this.slug())
  );

constructor() {
  effect(() => {
    const product = this.product();

    if (!product) {
      return;
    }

    this.store.setProductId(product.id);
    this.store.setProductSeoTags(product);
  });

  effect(() => {
    console.log('category:', this.store.category());
    console.log('backRoute:', this.backRoute());
  });
}

  backRoute = computed(() => `/products/${this.store.category()}`);
}