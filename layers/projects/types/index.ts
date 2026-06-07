export type ProjectAccessType = 'FREE' | 'PREMIUM';
export type ProjectStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
export type MediaAssetKind = 'COVER_IMAGE' | 'IMAGE' | 'VIDEO' | 'PDF' | 'EBOOK' | 'RESOURCE';
export type MediaAssetVisibility = 'PRIVATE' | 'PUBLIC' | 'PROTECTED';

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface MentorSummaryDTO {
  id: number;
  userId: number;
  name: string;
  headline?: string | null;
  bio?: string | null;
  expertise?: string | null;
  websiteUrl?: string | null;
  isActive: boolean;
}

export interface MediaAssetDTO {
  id: number;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  assetKind: MediaAssetKind;
  visibility: MediaAssetVisibility;
  publicUrl?: string | null;
}

export interface ProjectLessonDTO {
  id: number;
  title: string;
  content?: string | null;
  isPreview: boolean;
  sortOrder: number;
  videoAsset?: MediaAssetDTO | null;
  assets?: MediaAssetDTO[];
}

export interface ProjectSectionDTO {
  id: number;
  title: string;
  sortOrder: number;
  lessons: ProjectLessonDTO[];
}

export interface ProjectDTO {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  description: string;
  objectives: string[];
  accessType: ProjectAccessType;
  status: ProjectStatus;
  price: string;
  currency: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: CategoryDTO | null;
  mentor: MentorSummaryDTO;
  coverAsset?: MediaAssetDTO | null;
  sections?: ProjectSectionDTO[];
  accessLocked?: boolean;
}
