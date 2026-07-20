import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Header} from "./layout/header/header";
import { inject } from '@angular/core';
import { EcommerceStore } from './ecommerce-store';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
   <app-header class=" z-10 relative"/>

   <div class="h-[calc(100%-64px)] overflow-auto">
    <router-outlet />
</div>
  `,
  styles: [],
})
export class App {
  private readonly store = inject(EcommerceStore);

  constructor() {
    this.store.loadProducts();
  }
}
