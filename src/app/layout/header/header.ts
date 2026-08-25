import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { EcommerceStore } from '../../ecommerce-store';
import { HeaderActions } from '../header-actions/header-actions';
import { DOCUMENT, NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, HeaderActions, RouterLink, NgIf],
  template: `
    <mat-toolbar class="site-header w-full elevated py-2">
      <div class="site-header__inner max-w-[1200px] mx-auto w-full flex items-center gap-4">
        <a
          routerLink="/"
          class="logo"
          (click)="store.resetFilters()"
        >
          C-TRADE
        </a>

        <button
          #catalogButton
          class="site-header__menu"
          (click)="toggleCategories()"
          type="button"
          aria-label="Открыть каталог"
          aria-controls="site-catalog-panel"
          [attr.aria-expanded]="store.categoriesOpen()"
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div class="site-header__search relative">

          <input
            type="text"
            placeholder="Search products..."
            class="site-header__search-input w-full px-3 py-2 border rounded-lg pr-10"
            [value]="store.search()"
            (input)="onSearch($event)"
          />

          <button
            *ngIf="store.search()"
            type="button"
            class="site-header__search-clear absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            (click)="clearSearch()"
            aria-label="Очистить поиск"
          >
            ✕
          </button>

        </div>

        <app-header-actions />
      </div>
    </mat-toolbar>

    @if (store.categoriesOpen()) {
      <div class="catalog-overlay" (click)="closeCategories()" aria-hidden="true"></div>
      <aside
        #catalogPanel
        id="site-catalog-panel"
        class="catalog-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Каталог товаров"
        tabindex="-1"
        (keydown)="trapCatalogFocus($event)"
      >
        <header class="catalog-panel__header">
          <h2>Каталог</h2>
          <button type="button" class="catalog-panel__close" (click)="closeCategories()" aria-label="Закрыть каталог">
            ×
          </button>
        </header>

        <nav class="catalog-panel__nav" aria-label="Категории каталога">
          @for (cat of store.categories(); track cat.value) {
            @if (cat.value !== 'all') {
              <a
                [routerLink]="'/products/' + cat.value"
                (click)="selectCategory()"
                [class.is-active]="cat.value === store.category()"
              >
                <span>{{ cat.label || 'Без категории' }}</span>
                <span class="catalog-panel__chevron" aria-hidden="true">›</span>
              </a>
            }
          }
        </nav>
      </aside>
    }
  `,
  styles: [`
    .logo {
      flex: 0 0 auto;
      font-weight: bold;
      font-size: 20px;
      text-decoration: none;
      color: inherit;
      white-space: nowrap;
    }

    .site-header {
      z-index: 50;
    }

    .site-header__inner {
      column-gap: 18px;
      min-width: 0;
    }

    .site-header__menu {
      align-items: center;
      background: #111827;
      border: 1px solid #111827;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      flex: 0 0 48px;
      font-weight: 800;
      font-size: 1.25rem;
      height: 42px;
      justify-content: center;
      line-height: 1;
      padding: 0;
      white-space: nowrap;
      width: 48px;
    }

    .site-header__menu:hover,
    .site-header__menu:focus-visible {
      background: #1f2937;
      outline: none;
    }

    .site-header__search {
      flex: 1 1 auto;
      min-width: 180px;
    }

    .site-header__search-input {
      height: 42px;
      min-width: 0;
    }

    app-header-actions {
      flex: 0 0 auto;
    }

    .catalog-overlay {
      background: rgba(17, 24, 39, 0.56);
      inset: 0;
      position: fixed;
      z-index: 1000;
    }

    .catalog-panel {
      background: #fff;
      box-shadow: 20px 0 60px rgba(15, 23, 42, 0.28);
      color: #111827;
      display: flex;
      flex-direction: column;
      height: 100dvh;
      left: 0;
      max-width: 100vw;
      position: fixed;
      top: 0;
      transform: translateX(0);
      width: min(400px, 100vw);
      z-index: 1001;
      animation: catalogPanelIn 240ms ease;
    }

    .catalog-panel__header {
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 16px;
      justify-content: space-between;
      min-height: 70px;
      padding: 16px 18px 14px 20px;
    }

    .catalog-panel__header h2 {
      font-size: 1.35rem;
      font-weight: 850;
      margin: 0;
    }

    .catalog-panel__close {
      align-items: center;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      cursor: pointer;
      display: inline-flex;
      font-size: 1.6rem;
      height: 40px;
      justify-content: center;
      line-height: 1;
      width: 40px;
    }

    .catalog-panel__close:hover,
    .catalog-panel__close:focus-visible {
      background: #fee2e2;
      color: #991b1b;
      outline: none;
    }

    .catalog-panel__nav {
      display: grid;
      gap: 2px;
      overflow-y: auto;
      padding: 10px;
    }

    .catalog-panel__nav a {
      align-items: center;
      border-radius: 8px;
      color: #111827;
      display: flex;
      font-weight: 700;
      gap: 14px;
      justify-content: space-between;
      line-height: 1.25;
      min-height: 48px;
      padding: 13px 12px 13px 14px;
      text-decoration: none;
    }

    .catalog-panel__nav a span:first-child {
      min-width: 0;
    }

    .catalog-panel__nav a:hover,
    .catalog-panel__nav a:focus-visible,
    .catalog-panel__nav a.is-active {
      background: #fee2e2;
      color: #991b1b;
      outline: none;
    }

    .catalog-panel__chevron {
      color: #9ca3af;
      flex: 0 0 auto;
      font-size: 1.35rem;
      line-height: 1;
    }

    @keyframes catalogPanelIn {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .catalog-panel {
        animation: none;
      }
    }

    @media (max-width: 640px) {
      .site-header__inner {
        align-items: stretch;
        column-gap: 10px;
        flex-wrap: wrap;
        row-gap: 8px;
      }

      .logo {
        order: 1;
      }

      .site-header__menu {
        flex-basis: 48px;
        height: 40px;
        order: 3;
        width: 48px;
      }

      .site-header__search {
        flex: 1 1 calc(100% - 58px);
        min-width: 0;
        order: 4;
      }

      app-header-actions {
        margin-left: auto;
        order: 2;
      }

      .catalog-panel {
        width: 100vw;
      }

      .catalog-panel__nav a {
        min-height: 50px;
        padding: 15px 14px;
      }
    }
  `]
})
export class Header {
  @ViewChild('catalogButton') private catalogButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('catalogPanel') private catalogPanel?: ElementRef<HTMLElement>;

  store = inject(EcommerceStore);
  private readonly document = inject(DOCUMENT);
  private previousOverflow = '';
  private previousPaddingRight = '';
  private previousBodyWidth = '';
  private previousAppRootWidth = '';
  private lockedScrollY = 0;

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearch(value);
  }

  clearSearch() {
    this.store.setSearch('');
  }

  toggleCategories() {
    if (this.store.categoriesOpen()) {
      this.closeCategories();
      return;
    }

    this.openCategories();
  }

  openCategories() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      this.store.openCategories();
      return;
    }

    this.lockScroll();
    this.store.openCategories();
    window.requestAnimationFrame(() => {
      this.catalogPanel?.nativeElement.focus();
    });
  }

  closeCategories() {
    if (!this.store.categoriesOpen()) {
      return;
    }

    this.store.closeCategories();
    this.unlockScroll();

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => this.catalogButton?.nativeElement.focus());
    }
  }

  selectCategory() {
    this.closeCategories();
  }

  trapCatalogFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }

    const panel = this.catalogPanel?.nativeElement;
    if (!panel) {
      return;
    }

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((item) => !item.hasAttribute('disabled'));

    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeCategories();
  }

  private lockScroll() {
    const body = this.document.body;
    const appRoot = this.document.querySelector<HTMLElement>('app-root');
    const scrollbarWidth = window.innerWidth - this.document.documentElement.clientWidth;

    this.lockedScrollY = window.scrollY;
    this.previousOverflow = body.style.overflow;
    this.previousPaddingRight = body.style.paddingRight;
    this.previousBodyWidth = body.style.width;
    this.previousAppRootWidth = appRoot?.style.width || '';

    const lockedLayoutWidth = body.clientWidth;

    body.style.width = `${lockedLayoutWidth}px`;

    if (appRoot) {
      appRoot.style.width = `${lockedLayoutWidth || appRoot.getBoundingClientRect().width}px`;
    }

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  private unlockScroll() {
    if (typeof window === 'undefined') {
      return;
    }

    const body = this.document.body;
    const appRoot = this.document.querySelector<HTMLElement>('app-root');

    body.style.overflow = this.previousOverflow;
    body.style.paddingRight = this.previousPaddingRight;
    body.style.width = this.previousBodyWidth;

    if (appRoot) {
      appRoot.style.width = this.previousAppRootWidth;
    }

    window.scrollTo({ top: this.lockedScrollY, left: 0, behavior: 'auto' });
  }
}
