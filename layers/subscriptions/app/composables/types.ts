export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'YEARLY';
  xenditPlanId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  subscriptionPlanId: number;
  provider: 'XENDIT';
  providerExternalId: string | null;
  status: 'INCOMPLETE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
}

export interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'YEARLY';
  isActive: boolean;
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingInterval?: 'MONTHLY' | 'YEARLY';
  isActive?: boolean;
}

export interface SubscriptionFilters {
  status?: string;
  page?: number;
  limit?: number;
}
