import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { CreateCheckoutData, CheckoutResponse } from './types';

export function useCreateCheckout() {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: CreateCheckoutData) => {
      const response = await http<TResponse<CheckoutResponse>>(ENDPOINT.PAYMENTS_CHECKOUT, {
        method: 'POST',
        body: params,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PAYMENTS_LIST] });
      $toast.info('Checkout created successfully');
    },
    onError: (error: { data: TResponse; status: number }) => {
      const errMessage = error.data.message;
      const message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
      if (error.status >= 400 && error.status < 500) {
        $toast.warning(message ?? 'Create checkout failed');
      } else {
        $toast.error(message ?? 'Internal Server Error');
      }
    },
  });
}
