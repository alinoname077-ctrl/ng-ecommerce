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

  private readonly siteName = 'C-Trade';
  private readonly defaultImage =
    'https://img01.flagma-tm.com/photo/zakupki-i-soprovozhdenie-sdelok-v-es-ot-imeni-vashey-kompanii-1760331_medium.jpg';
private readonly primaryOrigin = 'https://c-trade.kz';

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

    const fullUrl = origin + this.getCanonicalPath();

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
    const imageUrl = this.toAbsoluteUrl(seoData.image || this.defaultImage, origin);

    this.meta.updateTag({ property: 'og:type', content: seoData.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:title', content: `${title} | ${this.siteName}` });
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
    const organization = {
      '@type': 'Organization',
      '@id': `${this.primaryOrigin}/#organization`,
      name: this.siteName,
      url: this.primaryOrigin,
    };

    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        ...this.pageStructuredData(seoData, url, imageUrl),
      ],
    };

    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private productStructuredData(seoData: SeoData, url: string, imageUrl: string) {
    const product: Record<string, unknown> = {
      '@type': 'Product',
      '@id': `${url}#product`,
      name: seoData.title,
      description: seoData.description,
      image: imageUrl,
      url,
      sku: seoData.sku,
      brand: {
        '@type': 'Brand',
        name: seoData.brand || 'Ридан',
        alternateName: ['RIDAN', 'Ridan'],
      },
      category: seoData.category,
    };

    if (seoData.price && seoData.price > 0) {
      product['offers'] = {
        '@type': 'Offer',
        priceCurrency: seoData.currency || 'KZT',
        price: seoData.price.toString(),
        availability: seoData.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url,
      };
    }

    return product;
  }

  private pageStructuredData(seoData: SeoData, url: string, imageUrl: string) {
    if (seoData.type === 'product') {
      return [
        this.productStructuredData(seoData, url, imageUrl),
        this.breadcrumbStructuredData(seoData, url),
      ];
    }

    if (seoData.type === 'collection') {
      return [
        {
          '@type': 'CollectionPage',
          '@id': `${url}#collection`,
          name: seoData.title,
          description: seoData.description,
          url,
          about: {
            '@type': 'Brand',
            name: seoData.brand || 'Ридан',
            alternateName: ['RIDAN', 'Ridan'],
          },
        },
        {
          '@type': 'ItemList',
          '@id': `${url}#itemlist`,
          name: seoData.title,
          itemListElement: (seoData.items || []).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: item.url,
            item: {
              '@type': 'Product',
              name: item.name,
              url: item.url,
              image: item.image,
              brand: {
                '@type': 'Brand',
                name: seoData.brand || 'Ридан',
                alternateName: ['RIDAN', 'Ridan'],
              },
            },
          })),
        },
        this.breadcrumbStructuredData(seoData, url),
      ];
    }

    return [
      {
        '@type': 'WebSite',
        '@id': `${this.primaryOrigin}/#website`,
        name: this.siteName,
        url: this.primaryOrigin,
        description: seoData.description,
      },
    ];
  }

  private breadcrumbStructuredData(seoData: SeoData, url: string) {
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: this.siteName,
        item: this.primaryOrigin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: seoData.category || 'Каталог',
        item: seoData.categorySlug
          ? `${this.primaryOrigin}/products/${seoData.categorySlug}`
          : `${this.primaryOrigin}/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: seoData.title,
        item: url,
      },
    ];

    return {
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
  }

  private toAbsoluteUrl(url: string, origin: string) {
    try {
      return new URL(url, origin).toString();
    } catch {
      return this.defaultImage;
    }
  }

  private getCanonicalPath() {
    const currentUrl = this.router.url || '/';
    const [pathWithQuery] = currentUrl.split('#');
    const [path, queryString = ''] = pathWithQuery.split('?');
    const cleanPath = path || '/';

    if (cleanPath.startsWith('/products/') && queryString) {
      const params = new URLSearchParams(queryString);
      const page = Number(params.get('page') || '1');

      if (Number.isInteger(page) && page > 1) {
        return cleanPath + '?page=' + page;
      }
    }

    return cleanPath;
  }
}
