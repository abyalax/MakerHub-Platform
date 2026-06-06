import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Role } from '../types';

export function useGetRoles(params?: ComputedRef<Partial<MetaRequest>>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.ROLES_LIST, params ? unref(params) : {}]),
    queryFn: async () => {
      const response = await http<TResponse<Paginated<Role>>>(ENDPOINT.ROLES, {
        method: 'GET',
        query: params ? unref(params) : { page: 1, limit: 100 },
      });
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
