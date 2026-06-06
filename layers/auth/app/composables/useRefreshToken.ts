import { useMutation } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { User } from '~/layers/users/app/types';

export const useUseRefreshToken = () => {
  const http = useHttp();
  const authStore = useAuthStore();
  const router = useRouter();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async () =>
      await http<TResponse<User>>(ENDPOINT.REFRESH, {
        method: 'POST',
      }),
    onSuccess: (response) => {
      if (response.data) {
        authStore.setUser(response.data);
      }
    },
    onError: (error: { data: TResponse }) => {
      const response = error?.data;
      $toast.warning(response?.message ?? 'Your Session is expired');
      authStore.setAuthenticated(false);
      authStore.setUser(undefined);
      authStore.clearAuth();
      router.push('/login');
    },
  });
};
