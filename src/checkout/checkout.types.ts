export type CheckoutStatus =
  'pending' | 'payment_pending' | 'completed' | 'failed' | 'cancelled';

export type CheckoutResponse = {
  id: string;
  status: CheckoutStatus;
  createdAt: Date;
  items: Array<{
    productId: string;
    title: string;
    unitPriceMinor: number;
    currency: string;
    quantity: number;
  }>;
};
