import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';

export function useDeletePlan() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await http<TResponse<void>>(ENDPOINT.SUBSCRIPTION_PLAN_DETAIL(id), {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SUBSCRIPTION_PLANS_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SUBSCRIPTION_PLANS_ADMIN] });
      $toast.info('Plan deleted successfully');
    },
    onError: (error: { data: TResponse }) => {
      const response = error?.data;
      $toast.warning(response?.message ?? 'Delete plan failed');
    },
  });
}
