import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { EcommerceStore } from '../../ecommerce-store';
import { HeaderActions } from '../header-actions/header-actions';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, HeaderActions, RouterLink, NgIf],
  template: `
    <mat-toolbar class="site-header w-full elevated py-2">
      <div class="site-header__inner max-w-[1200px] mx-auto w-full flex items-center gap-4">

        <!-- LOGO -->
        <a
          routerLink="/products/all"
          class="logo"
          (click)="store.resetFilters()"
        >
          C-TRADE    
           Контакты: 8(708)172-40-84(Whatsapp)
        </a>
<button
  class="site-header__menu px-3 py-1 border rounded"
  (click)="toggleCategories()"
>
  ☰ 
</button>

        <!-- SEARCH -->
        <div class="site-header__search flex-1 relative">

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
  private readonly router = inject(Router);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearch(value);
  }

  clearSearch() {
    this.store.setSearch('');
  }

  toggleCategories() {
    if (this.router.url.startsWith('/products/')) {
      this.store.toggleCategories();
      return;
    }

    this.store.resetFilters();
    this.store.openCategories();

    this.router.navigate(['/products', 'all']).then((navigated) => {
      if (navigated) {
        this.scrollCatalogToTop();
      }
    });
  }

  private scrollCatalogToTop() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

      const scrollTargets = [
        document.scrollingElement,
        document.documentElement,
        document.body,
        document.querySelector('router-outlet')?.parentElement,
        document.querySelector('mat-sidenav-content'),
        document.querySelector('.mat-drawer-content'),
      ];

      for (const target of scrollTargets) {
        target?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    reset();
    window.requestAnimationFrame(() => window.requestAnimationFrame(reset));
  }
}
