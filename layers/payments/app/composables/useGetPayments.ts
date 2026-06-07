import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { PaymentHistoryFilters, PaymentHistoryResponse } from './types';

export function useGetPayments(params: ComputedRef<PaymentHistoryFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PAYMENTS_LIST, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<PaymentHistoryResponse>>(ENDPOINT.PAYMENTS, {
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
