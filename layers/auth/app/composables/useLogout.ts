import { useMutation } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import { useAuthStore } from './useAuthStore';
import { useRouter } from 'vue-router';

export function useLogout() {
  const http = useHttp();
  const authStore = useAuthStore();
  const router = useRouter();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async () => {
      const response = await http<TResponse>(ENDPOINT.LOGOUT, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      $toast.info('Successfully Logout');
      authStore.clearAuth();
      router.push('/login');
    },
    onError: (error: { data: TResponse }) => {
      const response = error?.data;
      $toast.warning(response?.message ?? 'Logout failed');
      authStore.setAuthenticated(true);
    },
  });
}
