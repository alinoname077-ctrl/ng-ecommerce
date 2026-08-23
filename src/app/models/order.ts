import { CartItem } from "./cart";

export type Order = {
    id: string;
    userId: string;
    total: number;
    items: CartItem[];
    currency?: 'KZT';
    paymentMethod?: 'Kaspi';
    paymentStatus: 'success' | 'failure' | 'PENDING' | 'PAID';
};
