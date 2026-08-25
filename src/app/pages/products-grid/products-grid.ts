import { isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ProductCard } from '../../components/product-card/product-card';
import { RouterModule } from '@angular/router';
import { EcommerceStore } from '../../ecommerce-store';
import { ToggleWishlistButton } from '../../components/toggle-wishlist-button/toggle-wishlist-button';
import { effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { WhatsappButton } from '../../components/whatsapp-button/whatsapp-button';

type CatalogSlide = {
  title: string;
  text: string;
  button: string;
  href: string;
  image?: string;
  imageType?: string;
  tone: 'ridan' | 'heat' | 'systems';
};

@Component({
  selector: 'app-products-grid',
  standalone: true,

  imports: [
  ProductCard,
  RouterModule,
  TitleCasePipe,
  ToggleWishlistButton,
  MatPaginatorModule,
  WhatsappButton,
],
  template: `
    <app-whatsapp-button />

    <section
      class="catalog-slider"
      tabindex="0"
      aria-roledescription="carousel"
      aria-label="Рекламные предложения Ridan"
      (mouseenter)="pauseSlider()"
      (mouseleave)="resumeSlider()"
      (focusin)="pauseSlider()"
      (focusout)="resumeSlider()"
      (keydown.arrowleft)="previousSlide()"
      (keydown.arrowright)="nextSlide()"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
    >
      <div class="catalog-slider__track" [style.transform]="'translateX(-' + activeSlide() * 100 + '%)'">
        @for (slide of slides; track slide.title; let index = $index) {
          <article
            class="catalog-slide"
            [class.catalog-slide--ridan]="slide.tone === 'ridan'"
            [class.catalog-slide--heat]="slide.tone === 'heat'"
            [class.catalog-slide--systems]="slide.tone === 'systems'"
            [attr.aria-hidden]="activeSlide() !== index"
            [attr.aria-label]="'Слайд ' + (index + 1) + ' из ' + slides.length"
          >
            @if (slide.image) {
              <picture class="catalog-slide__picture">
                <source [srcset]="slide.image" [type]="slide.imageType || 'image/jpeg'" />
                <img
                  class="catalog-slide__image"
                  [src]="slide.image"
                  alt=""
                  [attr.fetchpriority]="index === 0 ? 'high' : null"
                  [attr.loading]="index === 0 ? 'eager' : 'lazy'"
                  decoding="async"
                />
              </picture>
            }
            <div class="catalog-slide__shade"></div>
            <div class="catalog-slide__content">
              <p class="catalog-slide__eyebrow">{{ index === 0 ? 'C-Trade для инженерных систем' : 'Оборудование Ridan' }}</p>
              <h2>{{ slide.title }}</h2>
              <p>{{ slide.text }}</p>
              <a class="catalog-slide__button" [href]="slide.href" [attr.aria-label]="slide.button + ': ' + slide.title">
                {{ slide.button }}
              </a>
            </div>
          </article>
        }
      </div>

      <button class="catalog-slider__arrow catalog-slider__arrow--prev" type="button" (click)="previousSlide()" aria-label="Предыдущий слайд">
        ‹
      </button>
      <button class="catalog-slider__arrow catalog-slider__arrow--next" type="button" (click)="nextSlide()" aria-label="Следующий слайд">
        ›
      </button>

      <div class="catalog-slider__dots" role="tablist" aria-label="Выбор слайда">
        @for (slide of slides; track slide.title; let index = $index) {
          <button
            type="button"
            role="tab"
            [class.is-active]="activeSlide() === index"
            [attr.aria-selected]="activeSlide() === index"
            [attr.aria-label]="'Показать слайд: ' + slide.title"
            (click)="goToSlide(index)"
          ></button>
        }
      </div>
    </section>

    <section class="catalog-products bg-gray100">
      <div class="catalog-products__inner">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ categoryValue() | titlecase }}</h1>
        <p class="text-base text-gray-600 mb-6">
          {{ store.filteredProducts().length }} products found
        </p>
        <p class="text-sm text-gray-600 mb-6">
          <a routerLink="/brands/ridan" class="text-blue-600 font-semibold">
            Оборудование Ридан (RIDAN)
          </a>
          в каталоге C-Trade
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
  [pageIndex]="store.currentPage() - 1"
  [pageSizeOptions]="[24, 48, 96]"
  (page)="onPageChange($event)">
</mat-paginator>


<div class="products-page-controls flex justify-center items-center gap-4 mt-10">

  @if (store.currentPage() > 1) {
    <a
      class="px-4 py-2 border rounded"
      [routerLink]="['/products', categoryValue()]"
      [queryParams]="{ page: store.currentPage() - 1 }">
      ← Previous
    </a>
  } @else {
    <span class="px-4 py-2 border rounded opacity-50" aria-disabled="true">← Previous</span>
  }

  <span class="font-medium">
    Page {{ store.currentPage() }} of {{ store.totalPages() }}
  </span>

  @if (store.currentPage() < store.totalPages()) {
    <a
      class="px-4 py-2 border rounded"
      [routerLink]="['/products', categoryValue()]"
      [queryParams]="{ page: store.currentPage() + 1 }">
      Next →
    </a>
  } @else {
    <span class="px-4 py-2 border rounded opacity-50" aria-disabled="true">Next →</span>
  }

</div>

      </div>
    </section>
  `,
  styles: `
  .catalog-slider {
    aspect-ratio: 1180 / 264;
    background: #111827;
    border-radius: 8px;
    color: #fff;
    margin: 18px auto 0;
    max-width: 1180px;
    overflow: hidden;
    position: relative;
    width: calc(100% - 48px);
  }

  .catalog-slider:focus-visible {
    outline: 3px solid #ef4444;
    outline-offset: -3px;
  }

  .catalog-slider__track {
    display: flex;
    transition: transform 560ms ease;
    will-change: transform;
  }

  .catalog-slide {
    isolation: isolate;
    height: 100%;
    min-width: 100%;
    overflow: hidden;
    padding: 28px 76px 32px 42px;
    position: relative;
  }

  .catalog-slide--heat {
    background: linear-gradient(120deg, #111827 0%, #1e3a5f 52%, #b91c1c 100%);
  }

  .catalog-slide--systems {
    background: linear-gradient(120deg, #101820 0%, #374151 54%, #dc2626 100%);
  }

  .catalog-slide__picture,
  .catalog-slide__image,
  .catalog-slide__shade {
    inset: 0;
    position: absolute;
  }

  .catalog-slide__picture {
    z-index: -3;
  }

  .catalog-slide__image {
    height: 100%;
    object-fit: cover;
    object-position: right center;
    width: 100%;
  }

  .catalog-slide__shade {
    background:
      linear-gradient(90deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.9) 45%, rgba(17, 24, 39, 0.22) 100%),
      linear-gradient(180deg, rgba(17, 24, 39, 0.05) 0%, rgba(17, 24, 39, 0.44) 100%);
    z-index: -2;
  }

  .catalog-slide__content {
    max-width: 560px;
    position: relative;
    z-index: 1;
  }

  .catalog-slide__eyebrow {
    color: #fca5a5;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  .catalog-slide h2 {
    font-size: clamp(1.65rem, 3vw, 2.55rem);
    font-weight: 850;
    letter-spacing: 0;
    line-height: 1.04;
    margin: 0;
    max-width: 620px;
  }

  .catalog-slide__content > p:not(.catalog-slide__eyebrow) {
    color: #e5e7eb;
    font-size: 0.98rem;
    line-height: 1.45;
    margin: 12px 0 0;
    max-width: 520px;
  }

  .catalog-slide__button {
    align-items: center;
    background: #ef4444;
    border-radius: 8px;
    color: #fff;
    display: inline-flex;
    font-weight: 850;
    justify-content: center;
    margin-top: 18px;
    min-height: 42px;
    padding: 0 18px;
    text-decoration: none;
  }

  .catalog-slider__arrow {
    background: rgba(255, 255, 255, 0.94);
    border: 0;
    border-radius: 999px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
    color: #111827;
    cursor: pointer;
    display: grid;
    font-size: 2rem;
    height: 38px;
    line-height: 1;
    place-items: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 38px;
    z-index: 2;
  }

  .catalog-slider__arrow--prev { left: 16px; }
  .catalog-slider__arrow--next { right: 16px; }

  .catalog-slider__dots {
    bottom: 14px;
    display: flex;
    gap: 9px;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    z-index: 2;
  }

  .catalog-slider__dots button {
    background: rgba(255, 255, 255, 0.62);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    height: 10px;
    padding: 0;
    width: 10px;
  }

  .catalog-slider__dots button.is-active {
    background: #fff;
    width: 30px;
  }

  .catalog-products {
    margin-top: 18px;
  }

  .catalog-products__inner {
    margin: 0 auto;
    max-width: 1180px;
    padding: 24px;
    width: 100%;
  }

  :host ::ng-deep .mat-mdc-list-item {
    height: auto !important;
    min-height: 48px !important;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
  }

  :host ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset !important;
    line-height: 1.3 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .catalog-slider__track {
      transition: none;
    }
  }

  @media (max-width: 760px) {
    .catalog-slider {
      aspect-ratio: auto;
      min-height: 420px;
      width: calc(100% - 24px);
    }

    .catalog-slide {
      min-height: 420px;
      padding: 34px 52px 58px 22px;
    }

    .catalog-slide__shade {
      background:
        linear-gradient(90deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.9) 100%),
        linear-gradient(180deg, rgba(17, 24, 39, 0.18) 0%, rgba(17, 24, 39, 0.76) 100%);
    }

    .catalog-slide h2 {
      font-size: clamp(1.72rem, 8vw, 2.45rem);
    }

    .catalog-slider__arrow {
      height: 36px;
      width: 36px;
    }

    .catalog-slider__arrow--prev { left: 10px; }
    .catalog-slider__arrow--next { right: 10px; }

    .catalog-products__inner {
      padding: 18px 12px;
    }
  }
`,
})
export default class ProductsGrid implements OnDestroy {
private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
private sliderTimer: ReturnType<typeof setInterval> | undefined;
private touchStartX: number | undefined;
readonly activeSlide = signal(0);
readonly slides: CatalogSlide[] = [
  {
    title: 'Официальный поставщик продукции бренда Ridan',
    text: 'Тепловая и промышленная автоматика, оборудование и комплектующие для инженерных систем.',
    button: 'Смотреть оборудование',
    href: '/catalog',
    image: '/assets/banners/ridan-automation.jpg',
    imageType: 'image/jpeg',
    tone: 'ridan',
  },
  {
    title: 'Оборудование для отопления и теплоснабжения',
    text: 'Подберите надёжное оборудование Ridan для жилых, коммерческих и промышленных объектов.',
    button: 'Перейти в каталог',
    href: '/catalog',
    image: '/assets/banners/ridan-heat-exchanger.jpg',
    imageType: 'image/jpeg',
    tone: 'heat',
  },
  {
    title: 'Профессиональные решения Ridan',
    text: 'Выбирайте оборудование для современных инженерных систем.',
    button: 'Выбрать оборудование',
    href: '/catalog',
    image: '/assets/banners/ridan-pump-control.png',
    imageType: 'image/png',
    tone: 'systems',
  },
];

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
page = toSignal(
  this.route.queryParamMap,
  { initialValue: this.route.snapshot.queryParamMap }
);

categoryValue = computed(() =>
  this.category()?.get('category') ?? 'all'
);
pageValue = computed(() => {
  const rawPage = Number(this.page()?.get('page') || '1');

  return Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
});
  store = inject(EcommerceStore);

 

constructor() {
  effect(() => {
    const category = this.categoryValue();

    this.store.setCategory(category);
    this.store.goToPage(this.pageValue());
    this.store.setProductsListSeoTags(category);
  });

  this.startSlider();
}

ngOnDestroy() {
  this.stopSlider();
}

nextSlide() {
  this.activeSlide.update((index) => (index + 1) % this.slides.length);
  this.restartSlider();
}

previousSlide() {
  this.activeSlide.update((index) => (index - 1 + this.slides.length) % this.slides.length);
  this.restartSlider();
}

goToSlide(index: number) {
  this.activeSlide.set(index);
  this.restartSlider();
}

pauseSlider() {
  this.stopSlider();
}

resumeSlider() {
  this.startSlider();
}

onTouchStart(event: TouchEvent) {
  this.touchStartX = event.changedTouches[0]?.clientX;
  this.pauseSlider();
}

onTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX;

  if (this.touchStartX === undefined || endX === undefined) {
    this.resumeSlider();
    return;
  }

  const distance = this.touchStartX - endX;
  if (Math.abs(distance) > 42) {
    if (distance > 0) {
      this.nextSlide();
    } else {
      this.previousSlide();
    }
  } else {
    this.resumeSlider();
  }

  this.touchStartX = undefined;
}

private startSlider() {
  if (!this.isBrowser || this.sliderTimer || this.prefersReducedMotion()) {
    return;
  }

  this.sliderTimer = setInterval(() => {
    this.activeSlide.update((index) => (index + 1) % this.slides.length);
  }, 5500);
}

private stopSlider() {
  if (!this.sliderTimer) {
    return;
  }

  clearInterval(this.sliderTimer);
  this.sliderTimer = undefined;
}

private restartSlider() {
  this.stopSlider();
  this.startSlider();
}

private prefersReducedMotion() {
  return this.isBrowser && globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
}
