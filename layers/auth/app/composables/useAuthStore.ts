import { defineStore } from 'pinia';
import type { User } from '~/layers/users/app/types';
import type { AuthState } from './types';
import { computed, ref, watch } from 'vue';
import type { TResponse } from '~/layers/shared/app/types/response';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';

const createInitialState = (): AuthState => ({
  user: undefined,
  isAuthenticated: false,
});

export const useAuthStore = defineStore('auth', () => {
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

  function hydrateFromStorage() {
    if (!import.meta.client) return;
    const userJson = localStorage.getItem('auth_user');

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUser(user);
      } catch {
        clearAuth();
        localStorage.removeItem('auth_user');
      }
    }
  }

  watch(
    () => state.value.user,
    (newUser) => {
      if (!import.meta.client) return;
      if (newUser) {
        localStorage.setItem('auth_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('auth_user');
      }
    }
  );

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
    // State
    user,
    isAuthenticated,

    // Actions
    setUser,
    setAuthenticated,
    clearAuth,
    clearError,
    hydrateFromStorage,
    verifySession,
    refreshToken,
  };
});
