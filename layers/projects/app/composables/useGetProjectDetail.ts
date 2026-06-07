import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectDTO } from '../../types';

export function useGetProjectDetail() {
  const http = useHttp();
  const route = useRoute();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.PROJECT_DETAIL, route.params.slug]),
    queryFn: async () => {
      const response = await http<TResponse<ProjectDTO>>(ENDPOINT.PROJECT_DETAIL(route.params.slug as string), {
        method: 'GET',
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
