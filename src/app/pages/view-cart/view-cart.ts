import { Component, inject } from '@angular/core';
import { BackButton } from "../../components/back-button/back-button";
import { ListCartItems } from "./list-cart-items/list-cart-items";
import { TeaseWishlist } from "./tease-wishlist/tease-wishlist";
import { SummarizeOrder } from "../../components/summarize-order/summarize-order";
import { EcommerceStore } from '../../ecommerce-store';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-view-cart',
  imports: [
    BackButton,
    ListCartItems,
    TeaseWishlist,
    SummarizeOrder,
    MatButtonModule
],

  template: `
   <div class="cart-page mx-auto max-w-[1200px] py-6">
   <app-back-button class="mb-6" navigateTo="/products/all">Continue Shopping</app-back-button>
    <h1 class="text-xl font-extrabold mb-4">Shopping Cart</h1>

    <app-tease-wishlist class="mb-6 block" />
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <app-list-cart-items />
    </div>
    <div>
       <app-summarize-order>
          <ng-container actionButtons>
          <button matButton="filled" class="w-full mt-6 py-3"(click)="store.proceedToCheckout()">Proceed to Checkout</button>
          </ng-container>
        </app-summarize-order>
      </div>
   </div>
</div>
  `,
  styles: ``,
})
export default class ViewCart {

  store = inject(EcommerceStore);
}
 

