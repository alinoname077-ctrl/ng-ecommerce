import { Component, signal, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockStatus } from "../stock-status/stock-status";
import { QtySelector } from "../../../components/qty-selector/qty-selector";
import { Product } from '../../../models/product';
import { MatAnchor, MatButton, MatIconButton } from "@angular/material/button";
import { ToggleWishlistButton } from "../../../components/toggle-wishlist-button/toggle-wishlist-button";
import { EcommerceStore } from '../../../ecommerce-store';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-product-info',
  standalone: true, // 🔥 важно!
  imports: [CommonModule, StockStatus, QtySelector, MatAnchor, ToggleWishlistButton, MatIconButton, MatButton, MatIcon],
  template: `
    <div class="text-xs rounded-xl bg-gray-100 px-2 py-1 w-fit mb-2">
      {{ product().category | titlecase }}
    </div>
    <h1 class="text-2xl font-extrabold mb-4">{{ product().name }}</h1>
   @if(product().price > 0) {

  <p class="text-3xl font-bold mb-4">
    {{ product().price | number }} ₸
  </p>

} @else {

  <p class="text-3xl font-bold mb-4">
    Цена по запросу
  </p>

}
    <app-stock-status class="mb-4" [inStock]="product().inStock ?? true" />
    <h2 class="text-lg font-semibold mb-2">Описание</h2>
    <p class="text-gray-600 border-gray-200 pb-4">
      {{ product().description }}
    </p>
    <section class="border-y border-gray-200 py-4 my-4">
      <h2 class="text-lg font-semibold mb-3">Характеристики</h2>
      <dl class="grid grid-cols-[minmax(120px,180px)_1fr] gap-x-4 gap-y-2 text-sm text-gray-700">
        <dt class="font-semibold">Артикул</dt>
        <dd>{{ product().id }}</dd>

        <dt class="font-semibold">Бренд</dt>
        <dd>Ридан</dd>

        <dt class="font-semibold">Категория</dt>
        <dd>{{ product().category }}</dd>

        @if (product().subcategory) {
          <dt class="font-semibold">Подкатегория</dt>
          <dd>{{ product().subcategory }}</dd>
        }

        @if (product().series) {
          <dt class="font-semibold">Серия</dt>
          <dd>{{ product().series }}</dd>
        }
      </dl>
    </section>
    <div class="flex items-center gap-4 mb-3 pt-4">
      <span class="font-semibold">Quantity</span>
      <app-qty-selector 
        [quantity]="quantity()" 
        (qtyUpdated)="quantity.set($event)" 
      />
    </div>

<div class="product-actions flex gap-4 mb border-b border-gray-200 pb-4">
  <button 
  matButton="filled"
class="w-2/3 flex items-center gap-2"
(click)="store.addToCart(product(), quantity())"
[disabled]="!product().inStock"
>
<mat-icon>shopping_cart</mat-icon>
{{ (product().inStock ?? true) ? 'Add to Cart' : 'Out of Stock' }}
</button>
  <app-toggle-wishlist-button [product]="product()" />
  <button matIconButton>
    <mat-icon>share</mat-icon>
  </button>
</div>
<div class="pt-6 flex flex-col gap-2 text-gray-700 text-xs">
  <div class="flex items-center gap-3">
    <mat-icon class="small">local_shipping</mat-icon>
    <span>Free shipping on orders over $50</span>
  </div>
<div class="flex items-center gap-3">
    <mat-icon class="mall">autorenew</mat-icon>
    <span>30-day return policy</span>
  </div>
  <div class="flex items-center gap-3">
    <mat-icon class="mall">shield</mat-icon>
    <span>2-year warranty included</span>
  </div>
  </div>
  `,
styles:``,
})
export class ProductInfo {
  product = input.required<Product>();
store=inject(EcommerceStore);

  quantity = signal(1);
}
