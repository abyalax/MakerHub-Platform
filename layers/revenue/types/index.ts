import type { LearningClass } from '~/layers/learnings/types';
import type { MentorProfile } from '~/layers/mentors/types';
import type { RevenueRuleScope } from '~/layers/shared/app/common/enum';

export interface RevenueShareRule {
  id: number;
  scope: RevenueRuleScope;
  mentorId?: number;
  classId?: number;
  mentorPercent: string;
  platformPercent: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mentor?: MentorProfile;
  class?: LearningClass;
}
