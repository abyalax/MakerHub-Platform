import { defineStore } from 'pinia';
import type { User } from '~/layers/users/app/types';
import type { AuthState } from './types';
import { computed, ref } from 'vue';
import type { TResponse } from '~/layers/shared/app/types/response';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';

const AUTH_STORAGE_KEY = 'auth_state';

const createInitialState = (): AuthState => ({
  user: undefined,
  isAuthenticated: false,
});

export const useAuthStore = defineStore(
  'auth',
  () => {
    const state = ref<AuthState>(createInitialState());

    const { mutateAsync: refreshToken } = useUseRefreshToken();

    const user = computed(() => state.value.user);
    const isAuthenticated = computed(() => state.value.isAuthenticated);

    const setUser = (user?: User) => {
      if (!user) {
        clearAuth();
        return;
      }

      state.value.user = user;
      state.value.isAuthenticated = true;
      state.value.error = undefined;
    };

    const setAuthenticated = (authenticated: boolean) => {
      state.value.isAuthenticated = authenticated;
    };

    const clearAuth = () => {
      Object.assign(state.value, createInitialState());
    };

    const clearError = () => {
      state.value.error = undefined;
    };

    const hydrateFromStorage = () => {
      if (!import.meta.client) return;

      const rawState = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!rawState) return;

      try {
        const parsedState = JSON.parse(rawState) as Partial<AuthState>;

        state.value.user = parsedState.user;
        state.value.isAuthenticated = Boolean(parsedState.user);
        state.value.error = undefined;
      } catch {
        clearAuth();
      }
    };

    const verifySession = async () => {
      try {
        const config = useRuntimeConfig();

        const response = await $fetch<TResponse<User>>(ENDPOINT.VERIFY, {
          baseURL: config.public.apiBaseUrl,
          credentials: 'include',
        });

        setUser(response.data);
        return response.data;
      } catch (error) {
        clearAuth();
        throw error;
      }
    };

    return {
      user,
      isAuthenticated,

      setUser,
      setAuthenticated,
      clearAuth,
      clearError,
      hydrateFromStorage,
      verifySession,
      refreshToken,
    };
  },
  {
    persist: true,
  }
);
