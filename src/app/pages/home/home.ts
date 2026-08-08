import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EcommerceStore } from '../../ecommerce-store';

type HomeCategory = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <main class="home-page">
      <section class="hero" aria-labelledby="home-hero-title">
        <img
          class="hero__image"
          src="https://montrealcombustion.com/_astro/micromodulation-sonde-o2-chaufferie-hero.Drva7eJ3_UO5Vj.webp"
          alt="Инженер настраивает промышленную систему автоматики в котельной"
          loading="eager"
          decoding="async"
        />

        <div class="hero__overlay"></div>

        <div class="hero__content">
          <div class="hero__copy">
            <p class="hero__eyebrow">C-Trade для инженерных систем</p>

            <h1 id="home-hero-title" class="hero__title">
              Официальный поставщик продукции бренда
              <span>РИДАН</span>
            </h1>

            <p class="hero__text">
              Тепловая и промышленная автоматика, оборудование и комплектующие
              для инженерных систем.
            </p>

            <div class="hero__actions">
              <a
                class="primary-link"
                [href]="catalogHref('all')"
                (click)="openCatalog($event, 'all')"
              >
                ПЕРЕЙТИ В КАТАЛОГ
              </a>

              <a class="secondary-link" href="#home-categories">
                Смотреть категории
              </a>
            </div>
          </div>

          <div class="hero__panel" aria-label="Ключевые направления C-Trade">
            <div>
              <strong>РИДАН</strong>
              <span>автоматика и комплектующие</span>
            </div>
            <div>
              <strong>23</strong>
              <span>направления оборудования</span>
            </div>
            <div>
              <strong>B2B</strong>
              <span>подбор для инженерных задач</span>
            </div>
          </div>
        </div>
      </section>

      <section id="home-categories" class="section section--categories">
        <div class="section__head">
          <p class="section__eyebrow">Категории оборудования</p>
          <h2>Выберите направление РИДАН</h2>
          <p>
            Все карточки ведут в существующий каталог C-Trade без дублирования
            товаров на главной странице.
          </p>
        </div>

        <div class="category-grid">
          @for (category of categories(); track category.value) {
            <a
              class="category-card"
              [href]="catalogHref(category.value)"
              (click)="openCatalog($event, category.value)"
            >
              <span class="category-card__mark"></span>
              <span class="category-card__title">{{ category.label }}</span>
              <span class="category-card__action">Открыть категорию</span>
            </a>
          }
        </div>
      </section>

      <section class="section section--advantages" aria-labelledby="advantages-title">
        <div class="section__head">
          <p class="section__eyebrow">Преимущества C-Trade</p>
          <h2 id="advantages-title">Профессиональная поставка для объектов и сервиса</h2>
        </div>

        <div class="advantages">
          <article>
            <span>01</span>
            <h3>Оригинальная продукция</h3>
            <p>Оборудование РИДАН для тепловой автоматики, промышленности и инженерных систем.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Подбор под задачу</h3>
            <p>Каталог помогает быстро перейти к нужному направлению оборудования.</p>
          </article>

          <article>
            <span>03</span>
            <h3>Инженерный фокус</h3>
            <p>Структура главной страницы ориентирована на закупки, монтаж и обслуживание.</p>
          </article>
        </div>
      </section>

      <section class="section section--cta" aria-labelledby="catalog-cta-title">
        <div class="cta">
          <div>
            <p class="section__eyebrow">Каталог C-Trade</p>
            <h2 id="catalog-cta-title">Перейдите к полному списку оборудования</h2>
            <p>
              Откройте общий каталог или выберите категорию выше, чтобы начать
              просмотр товаров с первой позиции списка.
            </p>
          </div>

          <a
            class="primary-link primary-link--light"
            [href]="catalogHref('all')"
            (click)="openCatalog($event, 'all')"
          >
            ПЕРЕЙТИ В КАТАЛОГ
          </a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .home-page {
        background: #ffffff;
        color: #111827;
        min-height: 100%;
      }

      .hero {
        background: #111827;
        color: #ffffff;
        isolation: isolate;
        min-height: min(760px, calc(100svh - 64px));
        overflow: hidden;
        position: relative;
      }

      .hero__image {
        height: 100%;
        inset: 0;
        object-fit: cover;
        object-position: center;
        position: absolute;
        width: 100%;
        z-index: -3;
      }

      .hero__overlay {
        background:
          linear-gradient(90deg, rgba(17, 24, 39, 0.98) 0%, rgba(17, 24, 39, 0.9) 42%, rgba(17, 24, 39, 0.42) 100%),
          linear-gradient(180deg, rgba(17, 24, 39, 0.2) 0%, rgba(17, 24, 39, 0.86) 100%);
        inset: 0;
        position: absolute;
        z-index: -2;
      }

      .hero__content,
      .section {
        margin: 0 auto;
        max-width: 1280px;
        padding-left: 24px;
        padding-right: 24px;
      }

      .hero__content {
        align-items: end;
        display: grid;
        gap: 48px;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
        min-height: inherit;
        padding-bottom: 72px;
        padding-top: 72px;
      }

      .hero__copy {
        max-width: 820px;
      }

      .hero__eyebrow,
      .section__eyebrow {
        color: #ef4444;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        margin: 0;
        text-transform: uppercase;
      }

      .hero__title {
        font-size: clamp(2.5rem, 6vw, 5.75rem);
        font-weight: 850;
        letter-spacing: 0;
        line-height: 0.98;
        margin: 18px 0 0;
        max-width: 900px;
      }

      .hero__title span {
        color: #ef4444;
        white-space: nowrap;
      }

      .hero__text {
        color: #d1d5db;
        font-size: clamp(1rem, 1.7vw, 1.25rem);
        line-height: 1.7;
        margin: 28px 0 0;
        max-width: 680px;
      }

      .hero__actions {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 36px;
      }

      .primary-link,
      .secondary-link {
        align-items: center;
        border-radius: 8px;
        display: inline-flex;
        font-size: 0.86rem;
        font-weight: 800;
        justify-content: center;
        letter-spacing: 0.04em;
        min-height: 48px;
        padding: 0 22px;
        text-decoration: none;
        transition:
          background-color 180ms ease,
          border-color 180ms ease,
          color 180ms ease,
          transform 180ms ease;
      }

      .primary-link {
        background: #dc2626;
        color: #ffffff;
        box-shadow: 0 18px 42px rgba(127, 29, 29, 0.34);
      }

      .primary-link:hover {
        background: #ef4444;
        transform: translateY(-1px);
      }

      .secondary-link {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.24);
        color: #ffffff;
      }

      .secondary-link:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.4);
      }

      .hero__panel {
        backdrop-filter: blur(18px);
        background: rgba(17, 24, 39, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 18px;
        display: grid;
        gap: 0;
        overflow: hidden;
      }

      .hero__panel div {
        padding: 22px;
      }

      .hero__panel div + div {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }

      .hero__panel strong {
        color: #ffffff;
        display: block;
        font-size: 1.45rem;
        line-height: 1;
      }

      .hero__panel span {
        color: #cbd5e1;
        display: block;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-top: 8px;
      }

      .section {
        padding-bottom: 76px;
        padding-top: 76px;
      }

      .section--categories {
        scroll-margin-top: 88px;
      }

      .section__head {
        max-width: 760px;
      }

      .section__head h2,
      .cta h2 {
        color: #111827;
        font-size: clamp(1.85rem, 3vw, 3rem);
        font-weight: 820;
        letter-spacing: 0;
        line-height: 1.12;
        margin: 10px 0 0;
      }

      .section__head p:not(.section__eyebrow),
      .cta p:not(.section__eyebrow) {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.7;
        margin: 14px 0 0;
      }

      .category-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-top: 34px;
      }

      .category-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        color: inherit;
        display: flex;
        flex-direction: column;
        min-height: 150px;
        padding: 20px;
        text-decoration: none;
        transition:
          background-color 180ms ease,
          border-color 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease;
      }

      .category-card:hover {
        background: #ffffff;
        border-color: rgba(220, 38, 38, 0.32);
        box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
        transform: translateY(-2px);
      }

      .category-card__mark {
        background: #dc2626;
        border-radius: 999px;
        display: block;
        height: 9px;
        width: 42px;
      }

      .category-card__title {
        color: #111827;
        display: block;
        font-size: 1rem;
        font-weight: 760;
        line-height: 1.35;
        margin-top: 20px;
      }

      .category-card__action {
        color: #dc2626;
        display: block;
        font-size: 0.84rem;
        font-weight: 760;
        margin-top: auto;
        padding-top: 20px;
      }

      .section--advantages {
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        border-top: 1px solid #e2e8f0;
        max-width: none;
      }

      .section--advantages > * {
        max-width: 1280px;
      }

      .advantages {
        display: grid;
        gap: 18px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin-top: 34px;
      }

      .advantages article {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 26px;
      }

      .advantages span {
        color: #dc2626;
        display: block;
        font-size: 1.65rem;
        font-weight: 850;
      }

      .advantages h3 {
        color: #111827;
        font-size: 1.08rem;
        margin: 18px 0 0;
      }

      .advantages p {
        color: #64748b;
        font-size: 0.94rem;
        line-height: 1.65;
        margin: 10px 0 0;
      }

      .cta {
        align-items: center;
        background: #111827;
        border-radius: 18px;
        color: #ffffff;
        display: flex;
        gap: 28px;
        justify-content: space-between;
        padding: 40px;
      }

      .cta h2 {
        color: #ffffff;
      }

      .cta p:not(.section__eyebrow) {
        color: #cbd5e1;
        max-width: 680px;
      }

      .primary-link--light {
        background: #ffffff;
        color: #111827;
        flex: 0 0 auto;
        box-shadow: none;
      }

      .primary-link--light:hover {
        background: #f8fafc;
      }

      @media (max-width: 960px) {
        .hero__content {
          grid-template-columns: 1fr;
        }

        .hero__panel {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .hero__panel div + div {
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          border-top: 0;
        }

        .category-grid,
        .advantages {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .cta {
          align-items: flex-start;
          flex-direction: column;
        }
      }

      @media (max-width: 640px) {
        .hero {
          min-height: auto;
        }

        .hero__overlay {
          background:
            linear-gradient(180deg, rgba(17, 24, 39, 0.96) 0%, rgba(17, 24, 39, 0.9) 62%, rgba(17, 24, 39, 0.82) 100%),
            rgba(17, 24, 39, 0.78);
        }

        .hero__content,
        .section {
          padding-left: 16px;
          padding-right: 16px;
        }

        .hero__content {
          gap: 34px;
          padding-bottom: 46px;
          padding-top: 54px;
        }

        .hero__title {
          font-size: clamp(2.15rem, 11vw, 3.5rem);
        }

        .hero__actions,
        .primary-link,
        .secondary-link {
          width: 100%;
        }

        .hero__panel,
        .category-grid,
        .advantages {
          grid-template-columns: 1fr;
        }

        .hero__panel div + div {
          border-left: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .section {
          padding-bottom: 54px;
          padding-top: 54px;
        }

        .category-card {
          min-height: 132px;
        }

        .cta {
          border-radius: 14px;
          padding: 26px;
        }

        .primary-link--light {
          width: 100%;
        }
      }
    `,
  ],
})
export class Home {
  private readonly router = inject(Router);
  protected readonly store = inject(EcommerceStore);

  protected readonly categories = computed<HomeCategory[]>(() =>
    this.store.categories().filter((category) => category.value !== 'all'),
  );

  protected catalogHref(category: string): string {
    return `/products/${encodeURIComponent(category)}`;
  }

  protected openCatalog(event: MouseEvent, category: string): void {
    event.preventDefault();

    this.router.navigate(['/products', category]).then((navigated) => {
      if (navigated) {
        this.scrollCatalogToTop();
      }
    });
  }

  private scrollCatalogToTop(): void {
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
