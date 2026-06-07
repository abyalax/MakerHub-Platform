import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectProgress } from './types';

export function useGetProjectProgress(projectId: ComputedRef<number | null>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PROJECT_PROGRESS, unref(projectId)]),
    queryFn: async () => {
      if (!unref(projectId)) return null;
      const response = await http<TResponse<ProjectProgress>>(
        ENDPOINT.PROJECT_PROGRESS(unref(projectId)!),
        {
          method: 'GET',
        },
      );
      return response.data;
    },
    staleTime: 0,
    enabled: computed(() => !!unref(projectId)),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
