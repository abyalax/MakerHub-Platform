import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { TransactionFilters, TransactionResponse } from './types';

export function useGetTransactions(params: ComputedRef<TransactionFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.REVENUE_LIST, 'transactions', unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<TransactionResponse>>(ENDPOINT.REVENUE_TRANSACTIONS, {
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
