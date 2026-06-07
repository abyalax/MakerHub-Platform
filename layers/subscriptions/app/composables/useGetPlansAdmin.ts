import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { SubscriptionPlan, SubscriptionFilters } from './types';

export function useGetPlansAdmin(params: ComputedRef<SubscriptionFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.SUBSCRIPTION_PLANS_ADMIN, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<SubscriptionPlan[]>>(ENDPOINT.SUBSCRIPTION_PLANS_ADMIN, {
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
