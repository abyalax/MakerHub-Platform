import { useQuery } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Permission } from '../types';

export function useGetPermissions() {
  const http = useHttp();

  return useQuery({
    queryKey: [QUERY_KEY.PERMISSIONS_LIST],
    queryFn: async () => {
      const response = await http<TResponse<Permission[]>>(ENDPOINT.PERMISSIONS, {
        method: 'GET',
      });
      return response.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
