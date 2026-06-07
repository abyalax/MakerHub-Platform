import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';

export function useSubscribe() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await http<
        TResponse<{
          order: { id: number; orderNumber: string; amount: number; status: string };
          checkoutUrl: string;
        }>
      >(ENDPOINT.SUBSCRIPTION_CHECKOUT, {
        method: 'POST',
        body: { planId },
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.MY_SUBSCRIPTION] });
      $toast.info('Subscription checkout created successfully');
      // Redirect to checkout URL
      if (data.data.checkoutUrl) {
        globalThis.location.href = data.data.checkoutUrl;
      }
    },
    onError: (error: { data: TResponse; status: number }) => {
      const errMessage = error.data.message;
      const message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      if (error.status >= 400 && error.status < 500) {
        $toast.warning(message ?? 'Subscribe failed');
      } else {
        $toast.error(message ?? 'Internal Server Error');
      }
    },
  });
}
