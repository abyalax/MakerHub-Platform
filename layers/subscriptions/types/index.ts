import type { Entitlement } from '~/layers/entitlements/types';
import type { Order } from '~/layers/orders/types';
import type { BillingInterval, PaymentProvider, SubscriptionStatus } from '~/layers/shared/app/common/enum';
import type { User } from '~/layers/users/types';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string | undefined;
  price: string;
  currency: string;
  billingInterval: BillingInterval;
  xenditPlanId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];
  subscriptions: Subscription[];
}

export interface Subscription {
  id: number;
  userId: string;
  subscriptionPlanId: number;
  provider: PaymentProvider;
  providerExternalId?: string | undefined;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  subscriptionPlan: SubscriptionPlan;
  entitlements: Entitlement[];
}
