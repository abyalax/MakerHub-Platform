/**
 * Authorization middleware - Check permissions based on route meta
 *
 * Route meta structure:
 * {
 *   path: '/admin/users',
 *   component: () => import('~/pages/admin/users.vue'),
 *   meta: {
 *     requiresAuth: true,
 *     requiresPermissions: ['user:read'],
 *     requireAll: true // optional
 *   }
 * }
 */

import { isPublicPage, PAGES } from '../../../shared/app/common/const/pages';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresPermissions?: string[];
    requireAll?: boolean;
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const { canAccessRoute } = useAuthorize();
  const requiresPermissions = to.meta.requiresPermissions ?? [];
  const isProtected = !isPublicPage(to.path) || to.meta.requiresAuth || requiresPermissions.length > 0;

  // Skip if route does not require auth
  if (!isProtected) return;

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: PAGES.LOGIN,
      query: {
        redirect: to.fullPath,
      },
    });
  }

  // Allow if there is no permission requirement
  if (requiresPermissions.length === 0) return;

  const requiredPermissions = requiresPermissions;
  const requireAll = to.meta.requireAll !== false;
  const isAuthorized = canAccessRoute(requiredPermissions, requireAll);

  if (!isAuthorized) {
    console.warn('[Authorization Middleware] Not authorized for:', to.path);
    return navigateTo('/unauthorized');
  }
});
