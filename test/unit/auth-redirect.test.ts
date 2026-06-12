import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeInternalRedirect } from '../../layers/auth/app/utils/redirect';

const authStore = {
  isAuthenticated: false,
  clearAuth: vi.fn(),
  refreshToken: vi.fn(),
};

const canAccessRoute = vi.fn();
const navigateTo = vi.fn();

const createFetchError = (status: number, message: string) => ({
  status,
  data: { message },
  response: {
    status,
    data: { message },
  },
});

describe('auth redirects', () => {
  beforeEach(() => {
    authStore.isAuthenticated = false;
    authStore.clearAuth.mockReset();
    authStore.refreshToken.mockReset();
    canAccessRoute.mockReset();
    navigateTo.mockReset();

    vi.unstubAllGlobals();
    vi.resetModules();
    vi.stubGlobal('defineNuxtRouteMiddleware', (middleware: unknown) => middleware);
    vi.stubGlobal('useAuthStore', () => authStore);
    vi.stubGlobal('useAuthorize', () => ({ canAccessRoute }));
    vi.stubGlobal('navigateTo', navigateTo);
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: 'http://localhost:3000/api' } }));
    vi.stubGlobal('nextTick', () => Promise.resolve());
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated protected routes to login with redirect query', async () => {
    const middleware = (await import('../../layers/auth/app/middleware/authorization')).default;

    const result = middleware({
      path: '/users',
      fullPath: '/users?page=2',
      meta: {
        requiresAuth: true,
        requiresPermissions: ['user:read'],
      },
    } as never);

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: {
        redirect: '/users?page=2',
      },
    });
    expect(result).toBe(navigateTo.mock.results[0]?.value);
  });

  it('runs the authorization guard globally for routes with auth meta', async () => {
    const middleware = (await import('../../layers/auth/app/middleware/authorization.global')).default;

    const result = middleware({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {
        requiresAuth: true,
      },
    } as never);

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: {
        redirect: '/dashboard',
      },
    });
    expect(result).toBe(navigateTo.mock.results[0]?.value);
  });

  it('redirects unauthenticated dashboard access even when route meta is missing', async () => {
    const middleware = (await import('../../layers/auth/app/middleware/authorization.global')).default;

    const result = middleware({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {},
    } as never);

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: {
        redirect: '/dashboard',
      },
    });
    expect(result).toBe(navigateTo.mock.results[0]?.value);
  });

  it('allows public routes without authentication', async () => {
    const middleware = (await import('../../layers/auth/app/middleware/authorization.global')).default;

    const result = middleware({
      path: '/public/projects/demo',
      fullPath: '/public/projects/demo',
      meta: {},
    } as never);

    expect(result).toBeUndefined();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('redirects authenticated users without permission to unauthorized', async () => {
    authStore.isAuthenticated = true;
    canAccessRoute.mockReturnValue(false);

    const middleware = (await import('../../layers/auth/app/middleware/authorization')).default;

    const result = middleware({
      path: '/roles',
      fullPath: '/roles',
      meta: {
        requiresAuth: true,
        requiresPermissions: ['role:read'],
      },
    } as never);

    expect(canAccessRoute).toHaveBeenCalledWith(['role:read'], true);
    expect(navigateTo).toHaveBeenCalledWith('/unauthorized');
    expect(result).toBe(navigateTo.mock.results[0]?.value);
  });

  it('allows authenticated users with permission', async () => {
    authStore.isAuthenticated = true;
    canAccessRoute.mockReturnValue(true);

    const middleware = (await import('../../layers/auth/app/middleware/authorization')).default;

    const result = middleware({
      path: '/users',
      fullPath: '/users',
      meta: {
        requiresAuth: true,
        requiresPermissions: ['user:read'],
      },
    } as never);

    expect(result).toBeUndefined();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('refreshes an expired access token once and retries the original request', async () => {
    const request = vi.fn().mockRejectedValueOnce(createFetchError(401, 'Token Expired')).mockResolvedValueOnce({ data: 'ok' });
    const raw = vi.fn();

    vi.stubGlobal('$fetch', {
      create: vi.fn(() => Object.assign(request, { raw })),
    });
    authStore.refreshToken.mockResolvedValue({ data: { id: 1 } });

    const { useHttp } = await import('../../layers/shared/app/composable/useHttp');
    const http = useHttp();
    const response = await http('/users');

    expect(response).toEqual({ data: 'ok' });
    expect(authStore.refreshToken).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1]?.[1]).toMatchObject({ __authRefreshAttempted: true });
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('clears auth and redirects to login when refresh token is expired', async () => {
    const request = vi.fn().mockRejectedValue(createFetchError(401, 'Token Expired'));
    const raw = vi.fn();

    vi.stubGlobal('$fetch', {
      create: vi.fn(() => Object.assign(request, { raw })),
    });
    authStore.refreshToken.mockRejectedValue(createFetchError(401, 'Token Expired'));

    const { useHttp } = await import('../../layers/shared/app/composable/useHttp');
    const http = useHttp();

    await expect(http('/users')).rejects.toMatchObject({ status: 401 });
    expect(authStore.refreshToken).toHaveBeenCalledTimes(1);
    expect(authStore.clearAuth).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith('/login');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('does not refresh auth endpoints', async () => {
    const request = vi.fn().mockRejectedValue(createFetchError(401, 'Token Expired'));
    const raw = vi.fn();

    vi.stubGlobal('$fetch', {
      create: vi.fn(() => Object.assign(request, { raw })),
    });

    const { useHttp } = await import('../../layers/shared/app/composable/useHttp');
    const http = useHttp();

    await expect(http('/auth/refresh')).rejects.toMatchObject({ status: 401 });
    expect(authStore.refreshToken).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('does not refresh public project endpoints', async () => {
    const request = vi.fn().mockRejectedValue(createFetchError(401, 'Token Expired'));
    const raw = vi.fn();

    vi.stubGlobal('$fetch', {
      create: vi.fn(() => Object.assign(request, { raw })),
    });

    const { useHttp } = await import('../../layers/shared/app/composable/useHttp');
    const http = useHttp();

    await expect(http('/projects/public/free-project')).rejects.toMatchObject({ status: 401 });
    expect(authStore.refreshToken).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('normalizes only internal redirect targets', () => {
    expect(normalizeInternalRedirect('/projects/demo?tab=overview')).toBe('/projects/demo?tab=overview');
    expect(normalizeInternalRedirect('https://example.com')).toBe('/dashboard');
    expect(normalizeInternalRedirect('//example.com')).toBe('/dashboard');
    expect(normalizeInternalRedirect([' /projects/demo '])).toBe('/dashboard');
  });
});
