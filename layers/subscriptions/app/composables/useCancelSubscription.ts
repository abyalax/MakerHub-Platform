import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { Subscription } from './types';

export function useCancelSubscription() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await http<TResponse<Subscription>>(ENDPOINT.SUBSCRIPTION_CANCEL(id), {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.MY_SUBSCRIPTION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SUBSCRIPTIONS_ADMIN] });
      $toast.info('Subscription canceled successfully');
    },
    onError: (error: { data: TResponse }) => {
      const response = error?.data;
      $toast.warning(response?.message ?? 'Cancel subscription failed');
    },
  });
}
