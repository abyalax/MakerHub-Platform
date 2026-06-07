import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Subscription, SubscriptionFilters } from './types';

export function useGetAllSubscriptions(params: ComputedRef<SubscriptionFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.SUBSCRIPTIONS_ADMIN, unref(params)]),
    queryFn: async () => {
      const response = await http<
        TResponse<{
          subscriptions: Subscription[];
          pagination: { page: number; limit: number; total: number; pages: number };
        }>
      >(ENDPOINT.SUBSCRIPTIONS_ADMIN, {
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
