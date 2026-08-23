import { Component, computed, input } from '@angular/core';
import { CONTACT_CONFIG } from '../../config/contact.config';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  template: `
    <a
      [class]="buttonClass()"
      [href]="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      [attr.aria-label]="ariaLabel()"
      title="Написать в WhatsApp"
    >
      <svg
        class="whatsapp-button__icon"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M16.01 3.2c-7.06 0-12.8 5.72-12.8 12.76 0 2.25.59 4.45 1.72 6.39L3.1 29.02l6.84-1.79a12.8 12.8 0 0 0 6.07 1.53c7.06 0 12.8-5.72 12.8-12.76S23.07 3.2 16.01 3.2Zm0 23.4c-1.9 0-3.76-.51-5.39-1.47l-.39-.23-4.06 1.06 1.08-3.95-.26-.41a10.55 10.55 0 0 1-1.62-5.64c0-5.85 4.77-10.6 10.64-10.6s10.64 4.75 10.64 10.6-4.77 10.64-10.64 10.64Zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.7-.98-2.33-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>

      @if (showLabel()) {
        <span>{{ label() }}</span>
      }
    </a>
  `,
  styles: `
    :host {
      display: contents;
    }

    .whatsapp-button {
      align-items: center;
      background: #25d366;
      color: #ffffff;
      display: inline-flex;
      font-weight: 800;
      justify-content: center;
      text-decoration: none;
      transition:
        background-color 180ms ease,
        box-shadow 180ms ease,
        transform 180ms ease;
    }

    .whatsapp-button:hover {
      background: #1ebe5d;
      transform: translateY(-1px);
    }

    .whatsapp-button:focus-visible {
      outline: 3px solid rgba(37, 211, 102, 0.34);
      outline-offset: 3px;
    }

    .whatsapp-button--floating {
      border-radius: 999px;
      bottom: 24px;
      box-shadow: 0 16px 34px rgba(15, 23, 42, 0.22);
      height: 56px;
      position: fixed;
      right: 24px;
      width: 56px;
      z-index: 30;
    }

    .whatsapp-button--inline {
      border-radius: 8px;
      box-shadow: 0 12px 26px rgba(37, 211, 102, 0.2);
      gap: 10px;
      min-height: 44px;
      padding: 0 18px;
    }

    .whatsapp-button__icon {
      height: 28px;
      width: 28px;
    }

    .whatsapp-button--inline .whatsapp-button__icon {
      height: 22px;
      width: 22px;
    }

    @media (max-width: 640px) {
      .whatsapp-button--floating {
        bottom: 18px;
        height: 52px;
        right: 18px;
        width: 52px;
      }
    }
  `,
})
export class WhatsappButton {
  variant = input<'floating' | 'inline'>('floating');
  label = input('Написать в WhatsApp');

  protected readonly whatsappUrl = `https://wa.me/${CONTACT_CONFIG.whatsapp}?text=${encodeURIComponent(
    CONTACT_CONFIG.whatsappMessage,
  )}`;

  protected readonly buttonClass = computed(() => {
    return `whatsapp-button whatsapp-button--${this.variant()}`;
  });

  protected readonly showLabel = computed(() => this.variant() === 'inline');

  protected readonly ariaLabel = computed(() => this.label());
}
