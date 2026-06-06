import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { CreateRolePayload, Role } from '../types';

export function useCreateRole() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) =>
      http<TResponse<Role>>(ENDPOINT.ROLES, {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_LIST] });
      $toast.info('Create Role Successfully');
    },
  });
}
