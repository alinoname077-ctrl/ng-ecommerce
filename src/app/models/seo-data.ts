export interface SeoData {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product';

  sku?: string;
  brand?: string;
  category?: string;

  price?: number;
  currency?: string;
  inStock?: boolean;
}
