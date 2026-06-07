import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Payment } from './types';

export function useGetPaymentById(id: ComputedRef<number | null>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PAYMENT_DETAIL, unref(id)]),
    queryFn: async () => {
      if (!unref(id)) return null;
      const response = await http<TResponse<Payment>>(ENDPOINT.PAYMENT_DETAIL(unref(id)!), {
        method: 'GET',
      });
      return response.data;
    },
    staleTime: 0,
    enabled: computed(() => !!unref(id)),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
