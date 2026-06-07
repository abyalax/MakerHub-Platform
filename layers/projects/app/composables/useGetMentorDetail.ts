import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { MentorSummaryDTO, ProjectDTO } from '../../types';

export function useGetMentorDetail() {
  const http = useHttp();
  const route = useRoute();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.MENTOR_DETAIL]),
    queryFn: async () => {
      const response = await http<TResponse<MentorSummaryDTO & { projects: ProjectDTO[] }>>(ENDPOINT.MENTOR_DETAIL(route.params.id as string), {
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
