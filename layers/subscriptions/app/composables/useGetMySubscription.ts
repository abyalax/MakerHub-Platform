import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Subscription } from './types';

export function useGetMySubscription() {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.MY_SUBSCRIPTION],
    queryFn: async () => {
      try {
        const response = await http<TResponse<Subscription>>(ENDPOINT.SUBSCRIPTIONS, {
          method: 'GET',
        });
        return response.data;
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 0,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
