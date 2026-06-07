import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { SalesAnalytics } from './types';

export function useGetSalesAnalytics() {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.REVENUE_LIST, 'analytics'],
    queryFn: async () => {
      const response = await http<TResponse<SalesAnalytics[]>>(ENDPOINT.REVENUE_ANALYTICS, {
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
