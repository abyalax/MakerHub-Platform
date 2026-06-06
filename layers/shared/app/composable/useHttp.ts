import type { FetchOptions, FetchRequest, FetchResponse } from 'ofetch';
import { AUTH_ENDPOINTS } from '~/layers/shared/app/common/const/pages';
import type { TResponse, FetchError } from '../types/response';

type HttpOptions = Omit<FetchOptions, 'method'> & {
  method?:
    | 'GET'
    | 'HEAD'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'get'
    | 'head'
    | 'patch'
    | 'post'
    | 'put'
    | 'delete'
    | 'connect'
    | 'options'
    | 'trace';
  __authRefreshAttempted?: boolean;
};

type HttpClient = {
  <T = unknown>(request: FetchRequest, options?: HttpOptions): Promise<T>;
  raw<T = unknown>(request: FetchRequest, options?: HttpOptions): Promise<FetchResponse<T>>;
};

let refreshPromise: Promise<TResponse> | null = null;

const normalizePath = (request: FetchRequest) => {
  if (typeof request === 'string') {
    try {
      return new URL(request, 'http://localhost').pathname.replace(/\/+$/, '') || '/';
    } catch {
      return request.replace(/\/+$/, '') || '/';
    }
  }
  if (request instanceof URL) return request.pathname.replace(/\/+$/, '') || '/';
  if (typeof Request !== 'undefined' && request instanceof Request) {
    try {
      return new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    } catch {
      return request.url.replace(/\/+$/, '') || '/';
    }
  }
  return String(request.url).replace(/\/+$/, '') || '/';
};

const shouldSkipRefresh = (request: FetchRequest) => {
  const path = normalizePath(request);
  return AUTH_ENDPOINTS.has(path) || AUTH_ENDPOINTS.has(path.startsWith('/') ? path.slice(1) : `/${path}`);
};

const getResponseStatus = (error: unknown) => {
  if (!error || typeof error !== 'object') return undefined;
  const fetchError = error as FetchError;
  return fetchError.status ?? fetchError.response?.status ?? fetchError.cause?.status;
};

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '';
  const fetchError = error as FetchError;
  const possibleMessages = [fetchError.data?.message, fetchError.response?.data?.message, fetchError.cause?.data?.message];
  for (const message of possibleMessages) {
    if (message) {
      if (Array.isArray(message)) {
        return message[0] ?? '';
      }
      return message;
    }
  }
  return '';
};

const isTokenExpiredError = (error: unknown): boolean => {
  return getErrorMessage(error) === 'Token Expired';
};

export const useHttp = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  // Memanfaatkan $fetch native Nuxt dengan baseUrl konfigurasi
  const client = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
  });

  const refreshAuth = async () => {
    refreshPromise ??= authStore.refreshToken().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  };

  const requestWithRefresh = async <T>(request: FetchRequest, options?: HttpOptions, useRaw = false): Promise<T> => {
    try {
      return useRaw ? ((await client.raw<unknown>(request, options)) as T) : ((await client<unknown>(request, options)) as T);
    } catch (error) {
      const status = getResponseStatus(error);
      const alreadyRetried = options?.__authRefreshAttempted ?? false;
      const skipRefresh = shouldSkipRefresh(request);
      const isExpired = isTokenExpiredError(error);

      if (status !== 401 || alreadyRetried || skipRefresh || !isExpired) throw error;

      try {
        await refreshAuth();
        await nextTick();
      } catch (refreshError) {
        authStore.clearAuth();
        throw refreshError;
      }

      const retryOptions = {
        ...options,
        __authRefreshAttempted: true,
      } satisfies HttpOptions;

      return useRaw ? ((await client.raw<unknown>(request, retryOptions)) as T) : ((await client<unknown>(request, retryOptions)) as T);
    }
  };

  const http = (async <T = unknown>(request: FetchRequest, options?: HttpOptions): Promise<T> => {
    return requestWithRefresh<T>(request, options, false);
  }) as HttpClient;

  http.raw = async <T = unknown>(request: FetchRequest, options?: HttpOptions): Promise<FetchResponse<T>> => {
    return requestWithRefresh<FetchResponse<T>>(request, options, true);
  };

  return http;
};
