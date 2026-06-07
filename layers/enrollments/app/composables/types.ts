export interface Enrollment {
  id: number;
  userId: number;
  projectId: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  project?: {
    id: number;
    title: string;
    slug: string;
    coverAsset?: {
      id: number;
      publicUrl: string;
    };
  };
}

export interface ProjectWithProgress {
  id: number;
  title: string;
  slug: string;
  progressPercent: number;
  lastAccessed: string;
  status: 'ACTIVE' | 'COMPLETED';
  coverAsset?: {
    id: number;
    publicUrl: string;
  };
}

export interface EnrollmentFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface EnrollmentResponse {
  enrollments: Enrollment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ContinueLearningResponse {
  projectId: number | null;
  lessonId: number | null;
  lessonTitle: string | null;
  projectTitle: string | null;
  projectSlug: string | null;
}
