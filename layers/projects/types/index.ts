import type { Bookmark } from '~/layers/bookmarks/types';
import type { Enrollment } from '~/layers/enrollments/types';
import type { Entitlement } from '~/layers/entitlements/types';
import type { LearningClass } from '~/layers/learnings/types';
import type { MediaObject } from '~/layers/media/types';
import type { MentorProfile } from '~/layers/mentors/types';
import type { ContentAccessType, ContentStatus, ProgressStatus } from '~/layers/shared/app/common/enum';
import type { TrafficEvent } from '~/layers/traffics/types';
import type { User } from '~/layers/users/types';
import type { JSONContent } from '@tiptap/vue-3';

export interface CompletionCriteria {
  id: number;
  projectId?: number | undefined;
  lessonId?: number | undefined;
  assignmentId?: number | undefined;
  title: string;
  description?: string | undefined;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  project?: Project | undefined;
  lesson?: ProjectLesson;
  assignment?: ProjectAssignment;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  projects: Project[];
  classes: LearningClass[];
}

export interface LessonProgress {
  id: number;
  userId: string;
  lessonId: number;
  status: ProgressStatus;
  completedAt?: Date;
  updatedAt: Date;
  user: User;
  lesson: ProjectLesson;
}

export interface ProjectLesson {
  id: number;
  sectionId: number;
  videoAssetId?: number | undefined;
  title: string;
  content?: string | undefined;
  isPreview: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  section: ProjectSection;
  videoAsset?: MediaObject;
  assets: MediaObject[];
  assignments: ProjectAssignment[];
  completionCriteria: CompletionCriteria[];
  progress: LessonProgress[];
}

export interface ClassProject {
  classId: number;
  projectId: number;
  sortOrder: number;
  class: LearningClass;
  project: Project;
}

export interface ProjectProgress {
  id: number;
  userId: string;
  projectId: number;
  enrollmentId?: number | undefined;
  status: ProgressStatus;
  progressPercent: string;
  startedAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
  user: User;
  project: Project;
  enrollment?: Enrollment;
}

export interface ProjectAssignment {
  id: number;
  projectId: number;
  lessonId?: number | undefined;
  title: string;
  instructions: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
  lesson?: ProjectLesson;
  assets: MediaObject[];
  completionCriteria: CompletionCriteria[];
}

export interface ProjectSection {
  id: number;
  projectId: number;
  title: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
  lessons: ProjectLesson[];
}

export interface Project {
  id: number;
  mentorId: number;
  authorId: string;
  categoryId?: number | undefined;
  coverAssetId?: number | undefined;
  title: string;
  slug: string;
  summary?: string | undefined;
  description: string;
  contentJson?: JSONContent | undefined;
  tocJson?: { id: string; title: string; level: number }[] | undefined;
  objectives?: unknown;
  accessType: ContentAccessType;
  status: ContentStatus;
  price: string;
  currency: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  mentor: MentorProfile;
  author: User;
  category?: Category;
  coverAsset?: MediaObject;
  assets: MediaObject[];
  classProjects: ClassProject[];
  sections: ProjectSection[];
  assignments: ProjectAssignment[];
  completionCriteria: CompletionCriteria[];
  entitlements: Entitlement[];
  progress: ProjectProgress[];
  bookmarks: Bookmark[];
  trafficEvents: TrafficEvent[];
}

export interface CreateProjectPayload {
  title: string;
  slug?: string;
  summary?: string;
  description: string;
  contentJson?: JSONContent;
  objectives?: string[];
  mentorId?: number;
  categoryId?: number;
  coverAssetId?: string;
  accessType: ContentAccessType;
  status?: ContentStatus;
  price: number | string;
  currency?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  contentJson?: JSONContent;
  objectives?: string[];
  mentorId?: number;
  categoryId?: number;
  coverAssetId?: string;
  accessType?: ContentAccessType;
  status?: ContentStatus;
  price?: number | string;
  currency?: string;
}
