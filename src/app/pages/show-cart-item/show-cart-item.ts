import { Component, computed, inject, input, Signal, Type } from '@angular/core';
import { CartItem } from '../../models/cart';
import { QtySelector } from "../../components/qty-selector/qty-selector";
import { EcommerceStore } from '../../ecommerce-store';
import { SignalMethod, StateSource } from '@ngrx/signals';
import { Product } from '../../models/product';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-show-cart-item',
  imports: [QtySelector, MatButtonModule, MatIconModule],
  template: `
    <div class="cart-item grid grid-cols-3 grid-cols-[3fr_1fr_1fr] ">
      <div class="cart-item__product flex items-center gap-4">
        <img [src]="item().product.imageUrl" class="cart-item__image w-24 h-24 rounded-lg object-cover"[style.view-transition-name]="'product-image-' +item().product.id" />
<div class="cart-item__details">
      <div class="cart-item__name text-gray-900/' text-lg font-semibold">{{ item().product.name }}</div>
      <div class="cart-item__price text-gray-600 text-lg">\${{ item().product.price }}</div>
</div>
  </div>
  <app-qty-selector [quantity]="item().quantity" (qtyUpdated)="store.setItemQuantity({productId: item().product.id, quantity: $event})"/>

    <div class="cart-item__total flex flex-col items-end">
<div class="text-right font-semibold text-lg">
  \${{total()}}
  </div>
  <div class="flex -me-3">
   <button matIconButton (click)="store.moveToWishlist(item().product)">
    <mat-icon>favorite_border</mat-icon>
 </button>
 <button matIconButton class="danger" (click)="store.removeFromCart(item().product)">
    <mat-icon>delete</mat-icon>
 </button>
</div>
 
</div>

 </div>

  `,
  styles: ``,
})
export class ShowCartItem {
item = input.required<CartItem>();
store=inject(EcommerceStore);
total=computed(() => (this.item().product.price * this.item().quantity).toFixed(2))
}
