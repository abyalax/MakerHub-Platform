import type { LearningClass } from '~/layers/learnings/types';
import type { Order } from '~/layers/orders/types';
import type { Project } from '~/layers/projects/types';
import type { EntitlementType } from '~/layers/shared/app/common/enum';
import type { Subscription } from '~/layers/subscriptions/types';
import type { User } from '~/layers/users/types';

export interface Entitlement {
  id: number;
  userId: string;
  classId?: number | undefined;
  projectId?: number | undefined;
  orderId?: string | undefined;
  subscriptionId?: number | undefined;
  type: EntitlementType;
  startsAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  user: User;
  class?: LearningClass;
  project?: Project;
  order?: Order;
  subscription?: Subscription;
}
