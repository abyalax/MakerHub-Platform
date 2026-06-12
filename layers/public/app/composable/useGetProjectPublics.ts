import { useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { ComputedRef } from 'vue';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectPublic } from '../../types/index';
import { normalizePublicProjectPaginationMeta, type PublicProjectPaginationMeta } from './public-project-pagination';

type PublicProjectPaginatedResponse = Omit<Paginated<ProjectPublic>, 'meta'> & {
  meta: PublicProjectPaginationMeta;
};

export function useGetProjectPublics(params: ComputedRef<MetaRequest & Record<string, unknown>>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PROJECT_LIST, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<PublicProjectPaginatedResponse>>(ENDPOINT.PROJECTS.LIST_PUBLICS, {
        method: 'GET',
        query: unref(params),
      });
      return {
        ...response.data,
        meta: normalizePublicProjectPaginationMeta(response.data.meta),
      };
    },
    staleTime: 0,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
