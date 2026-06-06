import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { User } from '../types';

export function useGetUsers(params: ComputedRef<MetaRequest>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.USERS_LIST, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<Paginated<User>>>(ENDPOINT.USERS, {
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
