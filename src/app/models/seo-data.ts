export interface SeoData {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product';

  sku?: string;

  price?: number;
  currency?: string;
  inStock?: boolean;
}