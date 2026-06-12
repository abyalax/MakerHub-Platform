import type { LearningClass } from '~/layers/learnings/types';
import type { ProjectProgress } from '~/layers/projects/types';
import type { EnrollmentStatus } from '~/layers/shared/app/common/enum';
import type { User } from '~/layers/users/types';

export interface Enrollment {
  id: number;
  userId: string;
  classId: number;
  status: EnrollmentStatus;
  progressPercent: string;
  enrolledAt: Date;
  completedAt?: Date;
  user: User;
  class: LearningClass;
  projectProgress: ProjectProgress[];
}
