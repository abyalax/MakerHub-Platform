import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { ComputedRef } from 'vue';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Project } from '../../types';

export function useGetProjects(params: ComputedRef<MetaRequest>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PROJECT_LIST, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<Paginated<Project>>>(ENDPOINT.PROJECTS.LIST_MINE, {
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
