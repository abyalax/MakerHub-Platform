export interface Payment {
  id: string;
  orderId: string;
  externalId: string;
  amount: number;
  status: string;
  paidAt?: Date | null | undefined;
  createdAt: Date;
  order: Order;
}
