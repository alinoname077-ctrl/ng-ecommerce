import { Component, inject } from '@angular/core';
import { BackButton } from "../../components/back-button/back-button";
import { ShippingForm } from "./shipping-form/shipping-form";
import { SummarizeOrder } from "../../components/summarize-order/summarize-order";
import { EcommerceStore } from '../../ecommerce-store';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-checkout',
  standalone: true, // ← обязательно
  imports: [BackButton, ShippingForm, SummarizeOrder, MatButton],
  template: `
  <div class="checkout-page mx-auto max-w-[1200px] py-6">
    <app-back-button class="mb-4" navigateTo="/cart">Back to Cart</app-back-button>

    <h1 class="text-3xl font-extrabold mb-4">Checkout</h1>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6"> 

      <div class="lg:col-span-3 flex flex-col gap-6">
        <app-shipping-form></app-shipping-form>
      </div>

      <div class="lg:col-span-2">
        <app-summarize-order>
 <ng-container actionButtons>
          <button
            matButton="filled"
            class="w-full mt-6 py-3"
            [disabled]="store.loading()"
            (click)="store.placeOrder()"
            >
            {{ store.loading() ? 'Processing...' : 'Place Order' }}
          </button>
          <button
            matButton
            class="kaspi-payment-btn mt-3"
            [disabled]="store.loading()"
            (click)="store.startKaspiPayment()"
          >
            Оплатить через Kaspi
          </button>
 </ng-container>
</app-summarize-order>
      </div>

    </div>
  </div>
  `,
  styles: `
    .kaspi-payment-btn {
      width: 100%;
      min-height: 50px;
      background: #f14635;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    .kaspi-payment-btn:hover:not(:disabled) {
      filter: brightness(0.95);
    }

    .kaspi-payment-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
})
export default class Checkout {
store=inject(EcommerceStore);
}
