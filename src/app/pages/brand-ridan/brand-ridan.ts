import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { SeoManager } from '../../services/seo-manager';

type BrandCategory = {
  label: string;
  value: string;
  count: number;
};

@Component({
  selector: 'app-brand-ridan',
  standalone: true,
  imports: [RouterLink, ProductCard],
  template: `
    <main class="brand-page mx-auto max-w-[1200px] px-6 py-8">
      <nav class="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <a routerLink="/" class="text-blue-600">Главная</a>
        <span class="mx-2">/</span>
        <span>Ридан</span>
      </nav>

      <section class="mb-8">
        <p class="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          Бренд оборудования
        </p>
        <h1 class="text-3xl font-extrabold text-gray-900 mb-4">
          Ридан (RIDAN) в Казахстане
        </h1>
        <p class="text-base text-gray-700 leading-7 max-w-[860px]">
          В каталоге C-Trade представлены товары бренда Ридан / RIDAN / Ridan для инженерных
          систем: тепловая автоматика, насосное оборудование, приводная техника, холодильные
          компоненты и другие направления. На странице собраны реальные категории и товары из
          существующего каталога.
        </p>
        <p class="text-sm text-gray-600 mt-3">
          Найдено товаров Ридан: {{ ridanProducts().length }}
        </p>
      </section>

      <section class="mb-10" aria-labelledby="ridan-categories-title">
        <h2 id="ridan-categories-title" class="text-2xl font-bold text-gray-900 mb-4">
          Категории оборудования Ридан
        </h2>
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          @for (category of categories(); track category.value) {
            <a
              class="block rounded-lg border border-gray-200 bg-white p-4 text-gray-900 no-underline hover:border-red-300"
              [routerLink]="['/products', category.value]"
            >
              <span class="block font-semibold">{{ category.label }}</span>
              <span class="text-sm text-gray-500">{{ category.count }} товаров</span>
            </a>
          }
        </div>
      </section>

      <section aria-labelledby="ridan-products-title">
        <div class="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 id="ridan-products-title" class="text-2xl font-bold text-gray-900">
              Товары Ридан в каталоге
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Показаны позиции из реальной базы товаров C-Trade.
            </p>
          </div>
          <a routerLink="/products/all" class="text-blue-600 text-sm font-semibold">
            Перейти в полный каталог
          </a>
        </div>

        <div class="responsive-grid">
          @for (product of featuredProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class BrandRidan {
  private readonly productService = inject(ProductService);
  private readonly seoManager = inject(SeoManager);

  protected readonly ridanProducts = toSignal(this.productService.getRidanProducts(), {
    initialValue: [] as Product[],
  });

  protected readonly categories = computed<BrandCategory[]>(() => {
    const categories = new Map<string, BrandCategory>();

    for (const product of this.ridanProducts()) {
      const label = product.category || 'Без категории';
      const value = product.categorySlug || 'all';
      const existing = categories.get(value);

      if (existing) {
        existing.count += 1;
      } else {
        categories.set(value, { label, value, count: 1 });
      }
    }

    return Array.from(categories.values()).sort((a, b) => a.label.localeCompare(b.label));
  });

  protected readonly featuredProducts = computed(() => this.ridanProducts().slice(0, 24));

  constructor() {
    effect(() => {
      const products = this.featuredProducts();

      this.seoManager.updateSeoTags({
        title: 'Ридан (RIDAN) в Казахстане — оборудование и каталог',
        description:
          'Каталог оборудования Ридан / RIDAN / Ridan в Казахстане на C-Trade: категории, товары, артикулы и цены по запросу для инженерных систем.',
        type: 'collection',
        brand: 'Ридан',
        category: 'Бренды',
        items: products.map((product) => ({
          name: product.name,
          url: `https://c-trade.kz/product/${product.slug}`,
          image: product.imageUrl,
        })),
      });
    });
  }
}
