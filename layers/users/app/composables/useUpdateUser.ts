import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { UpdateUserPayload, User } from '../types';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';

export function useUpdateUser() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: { id: number; payload: UpdateUserPayload }) => {
      const response = await http<TResponse<User>>(`${ENDPOINT.USERS}/${params.id}`, {
        method: 'PUT',
        body: params.payload,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS_LIST] });
      $toast.info('Update User Successfully');
    },
    onError: (error: { data: TResponse; status: number }) => {
      const errMessage = error.data.message;
      const message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      if (error.status >= 400 && error.status < 500) {
        $toast.warning(message ?? 'Update User Failed');
      } else {
        $toast.error(message ?? 'Internal Server Error');
      }
    },
  });
}
