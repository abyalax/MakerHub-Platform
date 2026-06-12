import type { Project } from '@playwright/test';
import type { LearningClass } from '~/layers/learnings/types';
import type { ProjectLesson, ProjectAssignment } from '~/layers/projects/types';
import type { AssetKind, AssetVisibility } from '~/layers/shared/app/common/enum';
import type { User } from '~/layers/users/types';

export interface MediaObject {
  id: string;
  ownerId: string;
  projectId?: number | undefined;
  classId?: number | undefined;
  lessonId?: number | undefined;
  assignmentId?: number | undefined;
  bucket: string;
  objectKey: string;
  originalFileName: string;
  mimeType: string;
  originalName: string;
  size: number;
  assetKind: AssetKind;
  visibility: AssetVisibility;
  checksum?: string;
  publicUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  project?: Project;
  class?: LearningClass;
  lesson?: ProjectLesson;
  assignment?: ProjectAssignment;
  projectCoverUsages?: Project[];
  classCoverUsages?: LearningClass[];
  lessonVideoUsages?: ProjectLesson[];
}
