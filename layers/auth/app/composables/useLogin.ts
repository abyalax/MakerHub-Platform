import { useMutation } from '@tanstack/vue-query';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type { User } from '~/layers/users/app/types';
import type { LoginPayload } from '../types';
import { useAuthStore } from './useAuthStore';
import { useRouter } from 'vue-router';

interface ExtendedLoginPayload extends LoginPayload {
  redirectUrl?: string;
}

export function useLogin() {
  const http = useHttp();
  const authStore = useAuthStore();
  const router = useRouter();
  const { $toast } = useNuxtApp();

  return useMutation({
    mutationFn: async (params: ExtendedLoginPayload) => {
      const { redirectUrl, ...loginData } = params;
      const response = await http<TResponse<User>>(ENDPOINT.LOGIN, {
        method: 'POST',
        body: loginData,
      });
      return response;
    },
    onSuccess: (data: TResponse<User>, variables: ExtendedLoginPayload) => {
      const user = data.data;
      $toast.info(`Welcome back ${user.name}`);
      authStore.setUser(user);
      authStore.setAuthenticated(true);
      // Use redirectUrl if provided, otherwise default to dashboard
      const redirectTo = variables.redirectUrl ?? '/dashboard';
      router.push(redirectTo);
    },
    onError: (error: { data: TResponse }) => {
      const response = error?.data;
      $toast.warning(response?.message ?? 'Login failed');
      authStore.setAuthenticated(false);
    },
  });
}
