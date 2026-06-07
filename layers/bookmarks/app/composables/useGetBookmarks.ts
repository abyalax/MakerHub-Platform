import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { BookmarkWithDetails } from './types';

export function useGetBookmarks() {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.BOOKMARKS_LIST],
    queryFn: async () => {
      const response = await http<TResponse<BookmarkWithDetails[]>>(ENDPOINT.BOOKMARKS, {
        method: 'GET',
      });
      return response.data;
    },
    staleTime: 0,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
