export type DeliveryAddress = {
  city?: string;
  street?: string;
  apartment?: string;
  comment?: string;
};

export type UserOrderSummary = {
  id: string;
  total: number;
  currency: 'KZT';
  paymentStatus: string;
  createdAt: string;
};

export type User = {
  id: string;
  email?: string;
  name: string;
  imageUrl?: string;
  phoneNumber?: string;
  deliveryAddress?: DeliveryAddress;
  orderHistory: UserOrderSummary[];
};

export type SignUpParams = {
  name: string;
  email: string;
  password: string;
  checkout?: boolean;
  dialogId: string;
};

export type SignInParams = Omit<SignUpParams, 'name'>;
