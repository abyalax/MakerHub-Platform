import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { ProjectWithProgress } from './types';

export function useGetLearningLibrary() {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.LEARNING_LIBRARY],
    queryFn: async () => {
      const response = await http<TResponse<ProjectWithProgress[]>>(ENDPOINT.LEARNING, {
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
