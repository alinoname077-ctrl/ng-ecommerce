import { UserReview } from "./user-review";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  category: string;
  reviews: UserReview[];
  
}
