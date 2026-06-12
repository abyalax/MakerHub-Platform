import type { Entitlement } from '~/layers/entitlements/types';
import type { LearningClass } from '~/layers/learnings/types';
import type { Payment } from '~/layers/payments/types';
import type { GeneratedEventTicket, Ticket } from '~/layers/temp';
import type { PaymentProvider } from '~/layers/shared/app/common/enum';
import type { OrderStatus } from '~/layers/shared/app/types/enum';
import type { SubscriptionPlan } from '~/layers/subscriptions/types';
import type { User } from '~/layers/users/types';

export interface OrderItem {
  id: string;
  orderId: string;
  ticketId: string;
  quantity: number;
  price: number;
  subtotal: number;
  order: Order;
  /**@deprecated */
  ticket: Ticket;
  generatedTickets?: GeneratedEventTicket[];
}

export interface Order {
  id: string;
  userId: string;
  totalAmount?: number | undefined;
  status: OrderStatus;
  expiredAt?: Date | null;
  classId?: number;
  subscriptionPlanId?: number;
  orderNumber?: string;
  amount?: string;
  currency: string;
  provider?: PaymentProvider;
  providerInvoiceId?: string;
  checkoutUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user: User;
  class?: LearningClass;
  subscriptionPlan?: SubscriptionPlan;
  orderItems?: OrderItem[];
  payments?: Payment[];
  entitlements?: Entitlement[];
}
