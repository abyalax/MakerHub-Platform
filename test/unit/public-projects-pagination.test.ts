import { describe, expect, it } from 'vitest';
import { normalizePublicProjectPaginationMeta } from '../../layers/public/app/composable/public-project-pagination';

describe('public projects pagination normalization', () => {
  it('normalizes snake_case pagination meta to camelCase', () => {
    const meta = normalizePublicProjectPaginationMeta({
      current_page: 3,
      items_per_page: 12,
      total_count: 48,
      total_pages: 4,
      sortBy: [['createdAt', 'desc']],
      searchBy: ['title'],
      search: 'vue',
      select: ['id', 'title'],
    } as never);

    expect(meta).toMatchObject({
      currentPage: 3,
      itemsPerPage: 12,
      totalItems: 48,
      totalPages: 4,
      search: 'vue',
      select: ['id', 'title'],
    });
  });

  it('falls back to safe defaults when meta is missing', () => {
    expect(normalizePublicProjectPaginationMeta()).toMatchObject({
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 1,
    });
  });
});
