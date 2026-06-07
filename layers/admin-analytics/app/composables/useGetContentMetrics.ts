import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ContentMetrics, AnalyticsFilters } from './types';

export function useGetContentMetrics(params: ComputedRef<AnalyticsFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.ANALYTICS_LIST, 'content', unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<ContentMetrics>>(ENDPOINT.ANALYTICS_CONTENT, {
        method: 'GET',
        query: unref(params),
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
