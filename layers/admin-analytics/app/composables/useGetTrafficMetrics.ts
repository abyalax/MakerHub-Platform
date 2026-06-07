import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { TrafficMetrics, AnalyticsFilters } from './types';

export function useGetTrafficMetrics(params: ComputedRef<AnalyticsFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.ANALYTICS_LIST, 'traffic', unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<TrafficMetrics>>(ENDPOINT.ANALYTICS_TRAFFIC, {
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
