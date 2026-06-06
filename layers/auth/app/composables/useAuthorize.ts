/**
 * Authorization checking with redirect
 *
 * Usage:
 *   const { authorize, requirePermission } = useAuthorize()
 *   const allowed = authorize('user:delete')
 *   await requirePermission(['event:create', 'event:publish'], { requireAll: true })
 */

interface AuthorizeOptions {
  /**
   * AND logic if true, OR logic if false
   * Default: true
   */
  requireAll?: boolean;
  /**
   * Path for redirect if not authorized
   * Default: '/unauthorized'
   */
  redirectTo?: string;
  /**
   * Throw error instead of redirect
   * Default: false
   */
  throwError?: boolean;
}

export const useAuthorize = () => {
  const authStore = useAuthStore();
  const router = useRouter();
  const { hasAll, hasAny, has } = usePermission();

  /**
   * Check single permission without redirect
   */
  const authorize = (permissionKey: string): boolean => {
    return has(permissionKey);
  };

  /**
   * Require single permission with redirect/throw
   */
  const requirePermission = async (permissionKey: string, options?: AuthorizeOptions): Promise<void> => {
    const { throwError = false, redirectTo = '/unauthorized' } = options || {};

    if (!has(permissionKey)) {
      if (throwError) {
        throw new Error(`Missing permission: ${permissionKey}`);
      }
      await router.push(redirectTo);
    }
  };

  /**
   * Require multiple permissions with AND/OR logic
   */
  const requirePermissions = async (permissionKeys: string[], options?: AuthorizeOptions): Promise<void> => {
    const { requireAll = true, throwError = false, redirectTo = '/unauthorized' } = options || {};

    const isAuthorized = requireAll ? hasAll(permissionKeys) : hasAny(permissionKeys);

    if (!isAuthorized) {
      if (throwError) {
        throw new Error(`Missing permissions: ${permissionKeys.join(', ')}`);
      }
      await router.push(redirectTo);
    }
  };

  /**
   * Check route accessibility - for middleware
   */
  const canAccessRoute = (requiredPermissions?: string[], requireAll = true): boolean => {
    if (!authStore.isAuthenticated) {
      return false;
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    return requireAll ? hasAll(requiredPermissions) : hasAny(requiredPermissions);
  };

  /**
   * Guard for middleware
   */
  const guardRoute = async (requiredPermissions?: string[], requireAll = true, redirectTo = '/unauthorized'): Promise<boolean> => {
    const isAllowed = canAccessRoute(requiredPermissions, requireAll);

    if (!isAllowed && requiredPermissions && requiredPermissions.length > 0) {
      await router.push(redirectTo);
      return false;
    }

    return true;
  };

  return {
    authorize,
    requirePermission,
    requirePermissions,
    canAccessRoute,
    guardRoute,
  };
};
