import type { LearningClass } from '~/layers/learnings/types';
import type { Project } from '~/layers/projects/types';
import type { RevenueShareRule } from '~/layers/revenue/types';
import type { PayoutStatus } from '~/layers/shared/app/common/enum';
import type { TrafficEvent } from '~/layers/traffics/types';
import type { User } from '~/layers/users/types';

export interface MentorPayout {
  id: number;
  mentorId: number;
  amount: string;
  currency: string;
  status: PayoutStatus;
  periodStart: Date;
  periodEnd: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  mentor: MentorProfile;
}

export interface MentorProfile {
  id: number;
  userId: string;
  headline?: string | undefined;
  bio?: string | undefined;
  expertise?: string | undefined;
  websiteUrl?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  projects: Project[];
  classes: LearningClass[];
  revenueShareRules: RevenueShareRule[];
  payouts: MentorPayout[];
  trafficEvents: TrafficEvent[];
}
