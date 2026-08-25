export type SeoItem = {
  name: string;
  url: string;
  image?: string;
};

export type SeoData = {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product' | 'collection';
  sku?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  items?: SeoItem[];
  price?: number;
  currency?: string;
  inStock?: boolean;
};
