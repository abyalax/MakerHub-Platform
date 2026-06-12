export type PublicProjectPaginationMeta = {
  currentPage?: number;
  current_page?: number;
  itemsPerPage?: number;
  items_per_page?: number;
  totalItems?: number;
  total_count?: number;
  totalPages?: number;
  total_pages?: number;
  sortBy?: Array<[string, 'asc' | 'desc']>;
  searchBy?: string[];
  search?: string;
  select?: string[];
  filter?: Record<string, string | string[]>;
  cursor?: string;
};

export type NormalizedPublicProjectPaginationMeta = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  sortBy: Array<[string, 'asc' | 'desc']>;
  searchBy: string[];
  search: string;
  select: string[];
  filter?: Record<string, string | string[]>;
  cursor?: string;
};

export const normalizePublicProjectPaginationMeta = (
  meta?: PublicProjectPaginationMeta
): NormalizedPublicProjectPaginationMeta => ({
  itemsPerPage: meta?.itemsPerPage ?? meta?.items_per_page ?? 10,
  totalItems: meta?.totalItems ?? meta?.total_count ?? 0,
  currentPage: meta?.currentPage ?? meta?.current_page ?? 1,
  totalPages: meta?.totalPages ?? meta?.total_pages ?? 1,
  sortBy: meta?.sortBy ?? [],
  searchBy: meta?.searchBy ?? [],
  search: meta?.search ?? '',
  select: meta?.select ?? [],
  filter: meta?.filter,
  cursor: meta?.cursor,
});
