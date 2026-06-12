import type { LearningClass } from '~/layers/learnings/types';
import type { MentorProfile } from '~/layers/mentors/types';
import type { Project } from '~/layers/projects/types';
import type { TrafficEventType } from '~/layers/shared/app/common/enum';
import type { User } from '~/layers/users/types';
import type { Visitor } from '~/layers/visitors/types';

export interface TrafficEvent {
  id: number;
  visitorId?: number | undefined;
  userId?: string | undefined;
  projectId?: number | undefined;
  classId?: number | undefined;
  mentorId?: number | undefined;
  eventType: TrafficEventType;
  path: string;
  referrer?: string;
  searchTerm?: string;
  occurredAt: Date;
  visitor?: Visitor;
  user?: User;
  project?: Project;
  class?: LearningClass;
  mentor?: MentorProfile;
}
