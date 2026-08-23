import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EcommerceStore } from '../../ecommerce-store';
import { ViewPanel } from '../../directives/view-panel';

@Component({
  selector: 'app-payment-kaspi',
  imports: [DecimalPipe, MatButton, MatIcon, ViewPanel],
  template: `
    <div class="mx-auto max-w-[900px] py-6">
      <div appViewPanel>
        <div class="flex items-center gap-2 mb-6">
          <mat-icon>account_balance_wallet</mat-icon>
          <h1 class="text-3xl font-extrabold">Kaspi Test Payment</h1>
        </div>

        @if (order()) {
          <div class="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
            Тестовый режим — реальные деньги не списываются
          </div>

          <div class="space-y-4">
            <div class="flex justify-between gap-4 border-b pb-3">
              <span class="font-semibold">Номер тестового заказа</span>
              <span>{{ order()?.id }}</span>
            </div>

            <div class="space-y-3">
              @for (item of order()?.items; track item.product.id) {
                <div class="flex justify-between gap-4">
                  <div>
                    <p class="font-medium">{{ item.product.name }}</p>
                    <p class="text-sm text-gray-600">Количество: {{ item.quantity }}</p>
                  </div>
                  <span class="font-medium">
                    {{ item.product.price * item.quantity | number: '1.0-0' }} ₸
                  </span>
                </div>
              }
            </div>

            <div class="flex justify-between border-t pt-4 text-xl font-bold">
              <span>Итого</span>
              <span>{{ order()?.total | number: '1.0-0' }} ₸</span>
            </div>
          </div>

          <button
            matButton="filled"
            class="w-full mt-6 py-3"
            [disabled]="store.loading()"
            (click)="store.completeKaspiPayment()"
          >
            {{ store.loading() ? 'Обработка...' : 'Оплатить' }}
          </button>
        } @else {
          <p class="text-gray-600">Тестовый заказ не найден.</p>
          <button matButton="filled" class="mt-6" (click)="goToCheckout()">Вернуться к оформлению</button>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export default class PaymentKaspi {
  store = inject(EcommerceStore);
  private router = inject(Router);

  order = computed(() => this.store.currentOrder());

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
