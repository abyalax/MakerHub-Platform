export interface Payment {
  id: number;
  orderId: number;
  userId: number;
  provider: 'XENDIT';
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    project?: {
      id: number;
      title: string;
      slug: string;
    };
    class?: {
      id: number;
      title: string;
      slug: string;
    };
  };
}

export interface Order {
  id: number;
  userId: number;
  projectId: number | null;
  classId: number | null;
  subscriptionPlanId: number | null;
  orderNumber: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELED' | 'REFUNDED';
  provider: 'XENDIT';
  providerInvoiceId: string | null;
  checkoutUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    title: string;
    slug: string;
  };
  class?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface CreateCheckoutData {
  projectId: number;
}

export interface PaymentHistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CheckoutResponse {
  order: Order;
  checkoutUrl: string;
}

export interface XenditWebhookEvent {
  event_id: string;
  event_type: string;
  data: Record<string, unknown>;
  created_at: string;
}
