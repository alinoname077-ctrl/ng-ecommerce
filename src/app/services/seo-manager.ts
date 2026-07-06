import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { REQUEST } from '@angular/core';

import { SeoData } from '../models/seo-data';

@Injectable({
  providedIn: 'root',
})
export class SeoManager {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  private request = inject(REQUEST, { optional: true });

  private readonly siteName = 'Crocus Trade';
  private readonly defaultImage =
    'https://img01.flagma-tm.com/photo/zakupki-i-soprovozhdenie-sdelok-v-es-ot-imeni-vashey-kompanii-1760331_medium.jpg';
  private readonly primaryOrigin = 'https://ng-ecommerce-sigma.vercel.app';

  updateSeoTags(seoData: SeoData) {
    const title = seoData.title || this.siteName;
    const description = seoData.description || '';

    // ✅ Title + description (SSR-safe)
    this.title.setTitle(`${title} | ${this.siteName}`);
    this.meta.updateTag({ name: 'description', content: description });

    let origin = this.primaryOrigin;

    if (this.request) {
      const headers = this.request.headers as Headers | undefined;

      const protocol = (headers?.get('x-forwarded-proto') || this.request.url.split(':')[0] || 'https')
        .split(',')[0]
        .trim();

      const host =
        headers?.get('x-forwarded-host') ||
        headers?.get('host') ||
        '';

      const publicHost = host.split(',')[0].trim();
      const publicHostname = publicHost.split(':')[0];

      origin =
        publicHostname === 'localhost' || publicHostname === '127.0.0.1'
          ? `${protocol}://${publicHost}`
          : this.primaryOrigin;
    } else if (isPlatformBrowser(this.platformId)) {
      const browserHostname = window.location.hostname;

      origin =
        browserHostname === 'localhost' || browserHostname === '127.0.0.1'
          ? window.location.origin
          : this.primaryOrigin;
    }

    const fullUrl = origin + (this.router.url || '');

    // Canonical must be present in SSR HTML so crawlers can see it.
    if (fullUrl) {
      let canonicalLink = this.document.querySelector(
        "link[rel='canonical']"
      ) as HTMLLinkElement | null;

      if (!canonicalLink) {
        canonicalLink = this.document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        this.document.head.appendChild(canonicalLink);
      }

      canonicalLink.setAttribute('href', fullUrl);
    }

    // 🖼 OpenGraph
    const imageUrl = seoData.image || this.defaultImage;

    this.meta.updateTag({ property: 'og:type', content: seoData.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    this.updateStructuredData(seoData, fullUrl, imageUrl);
  }

  private updateStructuredData(seoData: SeoData, url: string, imageUrl: string) {
    const id = 'seo-structured-data';
    const existing = this.document.getElementById(id);
    existing?.remove();

    const data =
      seoData.type === 'product'
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: seoData.title,
            description: seoData.description,
            image: imageUrl,
            url,
            brand: {
              '@type': 'Brand',
              name: 'E-commerce',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: seoData.currency || 'USD',
              price: seoData.price?.toString(),
              availability: seoData.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              url,
            },
          }
        : {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: this.siteName,
            url,
            description: seoData.description,
          };

    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }
}
