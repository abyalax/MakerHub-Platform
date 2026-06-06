import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';

export function useDeleteRole() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: (id: number) =>
      http(`${ENDPOINT.ROLES}/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_LIST] });
      $toast.info('Delete Role Successfully');
    },
  });
}
