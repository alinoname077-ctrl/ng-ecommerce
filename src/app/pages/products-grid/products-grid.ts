import { Component, computed, inject, input, signal, TrackByFunction } from '@angular/core';
import { Product } from '../../models/product';
import { ProductCard } from '../../components/product-card/product-card';
import { MatSidenavContainer, MatSidenavContent, MatSidenav } from '@angular/material/sidenav';
import { MatNavList, MatListItem } from '@angular/material/list';
import { RouterLink, RouterModule } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { EcommerceStore } from '../../ecommerce-store';
import { ToggleWishlistButton } from '../../components/toggle-wishlist-button/toggle-wishlist-button';
import { effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
@Component({
  selector: 'app-products-grid',
  standalone: true,

  imports: [
  ProductCard,
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
  MatNavList,
  MatListItem,
  RouterModule,
  TitleCasePipe,
  ToggleWishlistButton,
  MatPaginatorModule,
],
  template: `
    <mat-sidenav-container>
   <mat-sidenav mode="side" [opened]="store.categoriesOpen()">
        <div class="p-6">
          <h2 class="text-lg text-gray-900">Categories</h2>

          <mat-nav-list>
           @for (cat of store.categories(); track cat.value) {
  <mat-list-item
    [activated]="cat.value === categoryValue()"
    class="my-2"
    [routerLink]="['/products', cat.value]"
  >
    <span
      matListItemTitle
      class="font-medium"
      [class]="cat.value === categoryValue() ? '!text-white' : null"
    >
      {{ cat.label }}
    </span>
  </mat-list-item>
}
          </mat-nav-list>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="bg-gray100 p-6 h-full">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ categoryValue() | titlecase }}</h1>
        <p class="text-base text-gray-600 mb-6">
          {{ store.filteredProducts().length }} products found
        </p>

        <div class="responsive-grid">
          @for (product of store.pagedProducts(); track product.id) {
            <app-product-card [product]="product">
              <app-toggle-wishlist-button
                class="!absolute z-10 top-3 right-3 !bg-white shadow-md rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
                [product]="product"
                [style.view-transition-name]="'wishlist-button-' + product.id"
              />
            </app-product-card>
          }
        </div>
<p class="mt-4">
  Page: {{ store.currentPage() }}
</p>

<mat-paginator
  class="mt-8"
  [length]="store.totalProducts()"
  [pageSize]="store.pageSize()"
  [pageSizeOptions]="[24, 48, 96]"
  (page)="onPageChange($event)">
</mat-paginator>


<div class="flex justify-center items-center gap-4 mt-10">

  <button
    class="px-4 py-2 border rounded disabled:opacity-50"
    (click)="store.previousPage()"
    [disabled]="store.currentPage() === 1">
    ← Previous
  </button>

  <span class="font-medium">
    Page {{ store.currentPage() }} of {{ store.totalPages() }}
  </span>

  <button
    class="px-4 py-2 border rounded disabled:opacity-50"
    (click)="store.nextPage()"
    [disabled]="store.currentPage() >= store.totalPages()">
    Next →
  </button>

</div>

      </mat-sidenav-content>
    </mat-sidenav-container>

    <div class="bg-gray100 p-6 h-full"></div>
  `,
  styles: ``,
})
export default class ProductsGrid {
onPageChange(event: PageEvent) {

  if (event.pageSize !== this.store.pageSize()) {
    this.store.setPageSize(event.pageSize);
  }

  this.store.goToPage(event.pageIndex + 1);
}
route = inject(ActivatedRoute);

category = toSignal(
  this.route.paramMap,
  { initialValue: this.route.snapshot.paramMap }

);

categoryValue = computed(() =>
  this.category()?.get('category') ?? 'all'
);
  store = inject(EcommerceStore);

 

constructor() {
  effect(() => {
    const category = this.categoryValue();

    this.store.setCategory(category);
    this.store.setProductsListSeoTags(category);
  });
}}