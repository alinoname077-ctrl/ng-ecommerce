export interface SeoData {
  title: string;
  description: string;
  image?: string;
  type?: 'website'|'product';
  price?: number;
  currency?: string;
  inStock?: boolean;
}
