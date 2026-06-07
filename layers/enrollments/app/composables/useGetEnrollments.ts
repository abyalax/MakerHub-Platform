import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { EnrollmentFilters, EnrollmentResponse } from './types';

export function useGetEnrollments(params: ComputedRef<EnrollmentFilters>) {
  const http = useHttp();

  return useQuery({
    queryKey: computed(() => [QUERY_KEY.ENROLLMENTS_LIST, unref(params)]),
    queryFn: async () => {
      const response = await http<TResponse<EnrollmentResponse>>(ENDPOINT.ENROLLMENTS, {
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
