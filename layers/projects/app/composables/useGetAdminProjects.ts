import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectDTO } from '../../types';

export function useGetAdminProjects(params: ComputedRef<MetaRequest>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.ADMIN_LIST_PROJECTS, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<Paginated<ProjectDTO>>>(ENDPOINT.ADMIN_LIST_PROJECTS, {
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
