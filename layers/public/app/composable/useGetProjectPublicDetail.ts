import { useQuery } from '@tanstack/vue-query';
import { computed, unref, type ComputedRef } from 'vue';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectPublic } from '../../types';

export function useGetProjectPublicDetail(slug: ComputedRef<string>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PROJECT_PUBLIC_DETAIL, unref(slug)]),
    queryFn: async () => {
      const response = await http<TResponse<ProjectPublic>>(ENDPOINT.PROJECTS.DETAIL_PUBLIC(unref(slug)), {
        method: 'GET',
      });
      return response.data;
    },
    staleTime: 0,
    enabled: computed(() => Boolean(unref(slug))),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
