export interface LessonProgress {
  id: number;
  userId: number;
  lessonId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt: string | null;
  updatedAt: string;
}

export interface ProjectProgress {
  id: number;
  userId: number;
  projectId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface UpdateLessonProgressData {
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
}

export interface UpdateProjectProgressData {
  status: 'IN_PROGRESS' | 'COMPLETED';
}
