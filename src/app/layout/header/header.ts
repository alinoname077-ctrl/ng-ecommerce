import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { EcommerceStore } from '../../ecommerce-store';
import { HeaderActions } from '../header-actions/header-actions';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, HeaderActions, RouterLink, NgIf],
  template: `
    <mat-toolbar class="w-full elevated py-2">
      <div class="max-w-[1200px] mx-auto w-full flex items-center gap-4">

        <!-- LOGO -->
        <a
          routerLink="/products/all"
          class="logo"
          (click)="store.resetFilters()"
        >
          E-commerce
        </a>
        <button
  class="px-3 py-1 border rounded"
  (click)="store.toggleCategories()"
>
  ☰ 
</button>

        <!-- SEARCH -->
        <div class="flex-1 relative">

          <input
            type="text"
            placeholder="Search products..."
            class="w-full px-3 py-2 border rounded-lg pr-10"
            [value]="store.search()"
            (input)="onSearch($event)"
          />

          <!-- ❌ CLEAR BUTTON -->
          <button
            *ngIf="store.search()"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            (click)="clearSearch()"
          >
            ✕
          </button>

        </div>

        <!-- CART + WISHLIST -->
        <div class="flex gap-4 text-sm">
         
        </div>

        <app-header-actions />
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .logo {
      font-weight: bold;
      font-size: 20px;
      text-decoration: none;
      color: inherit;
    }
  `]
})
export class Header {
  store = inject(EcommerceStore);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearch(value);
  }

  clearSearch() {
    this.store.setSearch('');
  }
}