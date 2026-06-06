import { useInfiniteQuery as useVueInfiniteQuery } from '@tanstack/vue-query';
import { computed, type MaybeRef, unref } from 'vue';
import type { Paginated } from '../types/meta';

export interface InfiniteQueryOptions<T> {
  /** Unique key for this query (array or string) */
  queryKey: MaybeRef<unknown[]>;
  /** Async function that fetches a page. Receives page number & search string. */
  fetcher: (params: { page: number; limit: number; search: string }) => Promise<Paginated<T>>;
  /** Items per page (default: 20) */
  limit?: number;
  /** Reactive search string */
  search: MaybeRef<string>;
  /** Whether the query should run (default: true) */
  enabled?: MaybeRef<boolean>;
}

export function useInfiniteQuery<T>(options: InfiniteQueryOptions<T>) {
  const { queryKey, fetcher, limit = 20, search, enabled = true } = options;

  const query = useVueInfiniteQuery({
    queryKey: computed(() => [...unref(queryKey), { search: unref(search) }]),

    queryFn: async ({ pageParam = 1 }) => {
      return fetcher({
        page: pageParam as number,
        limit,
        search: unref(search),
      });
    },

    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },

    initialPageParam: 1,
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: computed(() => unref(enabled)),
  });

  /** Flat list of all loaded items across all pages */
  const flatItems = computed<T[]>(() => query.data.value?.pages.flatMap((page) => page.data) ?? []);

  /** Whether there are more pages to load */
  const hasMore = computed(() => query.hasNextPage.value);

  /** Total items count from last fetched page */
  const totalItems = computed(() => query.data.value?.pages.at(-1)?.meta.totalItems ?? 0);

  return {
    ...query,
    flatItems,
    hasMore,
    totalItems,
  };
}
