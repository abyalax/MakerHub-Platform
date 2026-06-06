/**
 * usePermission composable - Core permission checking
 *
 * Usage:
 *   const { can, has } = usePermission()
 *   if (can('user:delete')) { ... }
 */

import type { Permission } from '~/layers/users/app/types';

export const usePermission = () => {
  const authStore = useAuthStore();

  /**
   * Check is user has permission (synchronous)
   */
  const has = (permissionKey?: string): boolean => {
    if (!authStore.isAuthenticated || !authStore.user) return false;

    const directPermissions = authStore.user.permissions?.map((p: Permission) => p.key) ?? [];
    const rolePermissions = authStore.user.roles?.flatMap((role) => role.permissions?.map((p: Permission) => p.key) ?? []) ?? [];
    const userPermissions = [...new Set([...directPermissions, ...rolePermissions])];
    const hasPermission = userPermissions.includes(permissionKey ?? '-');

    return hasPermission;
  };

  /**
   * Alias for has() - semantic for v-if
   */
  const can = (permissionKey: string): boolean => {
    return has(permissionKey);
  };

  /**
   * Check multiple permissions with AND logic
   */
  const hasAll = (permissionKeys: string[]): boolean => {
    return permissionKeys.every((key) => has(key));
  };

  /**
   * Check multiple permissions with OR logic
   */
  const hasAny = (permissionKeys: string[]): boolean => {
    return permissionKeys.some((key) => has(key));
  };

  /**
   * Check is user has specific role
   */
  const hasRole = (roleName: string): boolean => {
    if (!authStore.isAuthenticated || !authStore.user) {
      return false;
    }

    return authStore.user.roles?.some((role) => role.name === roleName) || false;
  };

  /**
   * Check multiple roles with AND logic
   */
  const hasAllRoles = (roleNames: string[]): boolean => {
    return roleNames.every((name) => hasRole(name));
  };

  /**
   * Check multiple roles with OR logic
   */
  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some((name) => hasRole(name));
  };

  return {
    has,
    can,
    hasAll,
    hasAny,
    hasRole,
    hasAllRoles,
    hasAnyRole,
  };
};
