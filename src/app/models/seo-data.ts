export interface SeoData {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product' | 'collection';

  sku?: string;
  brand?: string;
  category?: string;
  items?: {
    name: string;
    url: string;
    image?: string;
  }[];

  price?: number;
  currency?: string;
  inStock?: boolean;
}
