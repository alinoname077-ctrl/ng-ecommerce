import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import {Header} from "./layout/header/header";
import { EcommerceStore } from './ecommerce-store';
import { AuthService } from './services/auth/auth.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Header, MatIcon],
  template: `
   <app-header class=" z-10 relative"/>

   <div #appShell class="app-shell h-[calc(100%-64px)] overflow-auto" (scroll)="onAppShellScroll(appShell.scrollTop)">
    <main>
      <router-outlet />
    </main>

    <footer class="site-footer" aria-label="Информация о C-TRADE">
      <div class="site-footer__inner">
        <section class="site-footer__brand">
          <h2>C-TRADE</h2>
          <p>
            Оборудование Ridan для систем отопления, теплоснабжения, водоснабжения и автоматизации.
          </p>
        </section>

        <nav class="site-footer__column" aria-label="Каталог">
          <h3>Каталог</h3>
          <a routerLink="/catalog">Каталог</a>
          <a routerLink="/products/nasosnoe-oborudovanie">Насосное оборудование</a>
          <a routerLink="/products/plastinchatye-teploobmenniki">Пластинчатые теплообменники</a>
          <a routerLink="/products/klapany-i-elektroprivody">Клапаны и электроприводы</a>
        </nav>

        <nav class="site-footer__column" aria-label="Покупателям">
          <h3>Покупателям</h3>
          <a routerLink="/checkout">Доставка и оплата</a>
          <a href="tel:+77081724084">Контакты</a>
        </nav>

        <address class="site-footer__column site-footer__contacts">
          <h3>Контакты</h3>
          <a href="tel:+77081724084" aria-label="Позвонить по номеру +7 708 172 40 84">
            +7 708 172 40 84
          </a>
          <a
            class="site-footer__whatsapp"
            href="https://wa.me/77081724084"
            target="_blank"
            rel="noopener"
            aria-label="Написать в WhatsApp на номер +7 708 172 40 84"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path
                d="M16.02 3.2c-6.98 0-12.66 5.62-12.66 12.52 0 2.2.59 4.34 1.71 6.22L3.2 28.8l7.08-1.83a12.8 12.8 0 0 0 5.74 1.36c6.98 0 12.66-5.62 12.66-12.53S23 3.2 16.02 3.2Zm0 22.99c-1.83 0-3.62-.48-5.18-1.39l-.37-.22-4.2 1.09 1.11-4.06-.24-.39a10.25 10.25 0 0 1-1.58-5.5c0-5.72 4.69-10.37 10.46-10.37s10.46 4.65 10.46 10.37-4.69 10.47-10.46 10.47Zm5.73-7.78c-.31-.15-1.86-.91-2.15-1.02-.29-.1-.5-.15-.71.16-.21.31-.82 1.02-1 1.23-.18.2-.37.23-.68.08-.31-.15-1.32-.48-2.52-1.54-.93-.82-1.56-1.83-1.74-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.2.05-.39-.03-.55-.08-.15-.71-1.7-.97-2.33-.25-.61-.51-.53-.71-.54h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.2 2.23 3.38 5.4 4.74.76.32 1.35.51 1.81.66.76.24 1.45.2 2 .12.61-.09 1.86-.75 2.12-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.2-.61-.36Z"
              />
            </svg>
            <span>WhatsApp</span>
          </a>
        </address>
      </div>

      <div class="site-footer__bottom">
        © C-TRADE. Все права защищены.
      </div>
    </footer>

    @if (showBackToTop()) {
      <button
        type="button"
        class="back-to-top"
        aria-label="Наверх"
        title="Наверх"
        (click)="scrollToTop(appShell)"
      >
        <mat-icon aria-hidden="true">arrow_upward</mat-icon>
      </button>
    }
  </div>
  `,
  styles: [`
    .app-shell {
      background: #f9fafb;
    }

    .site-footer {
      background: #111827;
      border-top: 4px solid #ef4444;
      color: #e5e7eb;
      margin-top: 48px;
    }

    .site-footer__inner {
      display: grid;
      gap: 32px;
      grid-template-columns: minmax(220px, 1.4fr) repeat(3, minmax(150px, 1fr));
      margin: 0 auto;
      max-width: 1200px;
      padding: 42px 24px 32px;
    }

    .site-footer h2,
    .site-footer h3,
    .site-footer p {
      margin: 0;
    }

    .site-footer h2 {
      color: #fff;
      font-size: 1.45rem;
      font-weight: 900;
      letter-spacing: 0.02em;
    }

    .site-footer h3 {
      color: #fff;
      font-size: 0.95rem;
      font-weight: 850;
      margin-bottom: 14px;
    }

    .site-footer__brand p {
      color: #cbd5e1;
      line-height: 1.55;
      margin-top: 14px;
      max-width: 360px;
    }

    .site-footer__column {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .site-footer__column a {
      color: #d1d5db;
      font-size: 0.95rem;
      line-height: 1.35;
      text-decoration: none;
      transition: color 160ms ease;
    }

    .site-footer__column a:hover,
    .site-footer__column a:focus-visible {
      color: #fff;
      outline: none;
    }

    .site-footer__contacts {
      font-style: normal;
    }

    .site-footer__whatsapp {
      align-items: center;
      display: inline-flex;
      gap: 8px;
      width: fit-content;
    }

    .site-footer__whatsapp svg {
      fill: #22c55e;
      height: 22px;
      width: 22px;
    }

    .site-footer__bottom {
      border-top: 1px solid rgba(229, 231, 235, 0.16);
      color: #9ca3af;
      font-size: 0.88rem;
      margin: 0 auto;
      max-width: 1200px;
      padding: 16px 24px 22px;
    }

    .back-to-top {
      align-items: center;
      background: #dc2626;
      border: 1px solid rgba(255, 255, 255, 0.76);
      border-radius: 50%;
      bottom: calc(env(safe-area-inset-bottom) + 168px);
      box-shadow: 0 16px 34px rgba(17, 24, 39, 0.24);
      color: #ffffff;
      cursor: pointer;
      display: inline-flex;
      height: 48px;
      justify-content: center;
      position: fixed;
      right: calc(env(safe-area-inset-right) + 24px);
      transition:
        background-color 160ms ease,
        box-shadow 160ms ease,
        transform 160ms ease;
      width: 48px;
      z-index: 1000005;
    }

    .back-to-top:hover {
      background: #b91c1c;
      box-shadow: 0 20px 40px rgba(17, 24, 39, 0.3);
      transform: translateY(-2px);
    }

    .back-to-top:focus-visible {
      outline: 3px solid rgba(220, 38, 38, 0.32);
      outline-offset: 3px;
    }

    .back-to-top mat-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    @media (max-width: 900px) {
      .site-footer__inner {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 560px) {
      .site-footer {
        margin-top: 36px;
      }

      .site-footer__inner {
        gap: 26px;
        grid-template-columns: 1fr;
        padding: 34px 20px 26px;
      }

      .site-footer__bottom {
        padding-inline: 20px;
      }

      .back-to-top {
        bottom: calc(env(safe-area-inset-bottom) + 206px);
        height: 48px;
        right: calc(env(safe-area-inset-right) + 12px);
        width: 48px;
      }
    }
  `],
})
export class App {
  private readonly store = inject(EcommerceStore);
  private readonly authService = inject(AuthService);
  protected readonly showBackToTop = signal(false);

  constructor() {
    effect(() => {
      this.store.setAuthenticatedUser(this.authService.user());
    });

    this.store.loadProducts();
  }

  onAppShellScroll(scrollTop: number) {
    this.showBackToTop.set(scrollTop >= 340);
  }

  scrollToTop(appShell: HTMLElement) {
    appShell.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
