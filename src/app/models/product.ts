import { UserReview } from './user-review';
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  priceOnRequest?: boolean;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;
  series?: string;
  reviews?: UserReview[];
}
