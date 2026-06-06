import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Role, UpdateRolePayload } from '../types';

export function useUpdateRole() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: (params: { id: number; payload: UpdateRolePayload }) =>
      http<TResponse<Role>>(`${ENDPOINT.ROLES}/${params.id}`, {
        method: 'PUT',
        body: params.payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_LIST] });
      $toast.info('Update Role Successfully');
    },
  });
}
