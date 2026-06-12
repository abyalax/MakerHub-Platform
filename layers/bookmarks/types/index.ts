import type { LearningClass } from '~/layers/learnings/types';
import type { Project } from '~/layers/projects/types';
import type { User } from '~/layers/users/types';

export interface Bookmark {
  id: number;
  userId: string;
  projectId?: number | undefined;
  classId?: number | undefined;
  isFavorite: boolean;
  createdAt: Date;
  user: User;
  project?: Project;
  class?: LearningClass;
}
