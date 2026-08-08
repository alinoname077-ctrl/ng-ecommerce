import { Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../models/product';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EcommerceStore } from '../../ecommerce-store';
import { Router, RouterLink } from '@angular/router';
import { StarRating } from "../star-rating/star-rating";

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatButton, MatIcon, RouterLink, StarRating, DecimalPipe],
  template: `
    <div
      class="product-card relative bg-white cursor-pointer rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
      (click)="openProduct()"
    >
      <img
        [src]="product().imageUrl"
        class="product-card__image w-full h-[300px] object-cover rounded-t-xl"
        [routerLink]="['/product', product().slug]"
        [style.view-transition-name]="'product-image-' + product().id"
      />

      <ng-content />

      <div class="product-card__body p-3 flex flex-col flex-1" [routerLink]="['/product', product().slug]">
        <h3 class="product-card__title text-base font-semibold text-gray-900 mb-1 leading-tight">
          {{ product().name }}
        </h3>

        <p class="product-card__description text-xs text-gray-600 mb-2 flex-1 leading-snug">
          {{ product().description }}
        </p>

       <app-star-rating class="mb-2" [rating]="product().rating">
({{ product().reviewCount }})

        </app-star-rating>

        <div class="text-xs font-medium mb-2">
          {{ product().inStock ? 'In Stock' : 'Out of Stock' }}
        </div>

        <div class="product-card__footer flex items-center justify-between mt-auto">

  @if(product().price > 0) {

   <span class="product-card__price text-xl font-bold text-gray-900">
      {{ product().price | number }} ₸
    </span>

  } @else {

    <span class="product-card__price text-lg font-bold text-gray-900">
      Цена по запросу
    </span>

  }


  <button matButton="filled" (click)="addToCart($event)">
    <mat-icon>shopping_cart</mat-icon>
    Add to Cart
  </button>

</div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ProductCard {
  product = input.required<Product>();

  store = inject(EcommerceStore);
  router = inject(Router);

  // 👇 ВСТАВЛЯЕШЬ СЮДА
  openProduct() {
    this.router.navigate(['/product', this.product().slug]);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.store.addToCart(this.product());
  }
}
