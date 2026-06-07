export interface Bookmark {
  id: number;
  userId: number;
  projectId: number | null;
  classId: number | null;
  createdAt: string;
}

export interface BookmarkWithDetails extends Bookmark {
  project?: {
    id: number;
    title: string;
    slug: string;
    coverAsset?: {
      id: number;
      publicUrl: string | null;
    };
  };
  progress?: {
    progressPercent: number;
    lastAccessed: string;
  };
  isFavorite: boolean;
}

export interface CreateBookmarkData {
  projectId: number;
}
