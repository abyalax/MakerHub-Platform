import type { Permission } from '~/layers/users/app/types';

export const PERMISSIONS = Object.freeze({
  // User Management
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
  },

  // Role Management
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
    ASSIGN_PERMISSION: 'role:assign-permission',
    ASSIGN_USER: 'role:assign-user',
  },

  PROJECT: {
    CREATE: 'project:create',
    READ: 'project:read',
    UPDATE: 'project:update',
    DELETE: 'project:delete',
  },
} as const);

export const permissionsList: Permission[] = [
  // User Management
  { id: 1, key: 'user:create', name: 'Create User' },
  { id: 2, key: 'user:read', name: 'Read User' },
  { id: 3, key: 'user:update', name: 'Update User' },
  { id: 4, key: 'user:delete', name: 'Delete User' },

  // Role Management
  { id: 5, key: 'role:create', name: 'Create Role' },
  { id: 6, key: 'role:read', name: 'Read Role' },
  { id: 7, key: 'role:update', name: 'Update Role' },
  { id: 8, key: 'role:delete', name: 'Delete Role' },
  { id: 9, key: 'role:assign-permission', name: 'Assign Permission to Role' },
  { id: 10, key: 'role:assign-user', name: 'Assign User to Role' },

  // System (admin-only internal)
  { id: 37, key: 'permission:create', name: 'Create Permission' },
  { id: 38, key: 'permission:read', name: 'Read Permission' },
  { id: 39, key: 'permission:update', name: 'Update Permission' },
  { id: 40, key: 'permission:delete', name: 'Delete Permission' },
];

/**
 * Get permission name by key
 */
export const getPermissionName = (key: string): string => {
  return permissionsList.find((p) => p.key === key)?.name || key;
};

/**
 * Get permission key by id
 */
export const getPermissionKey = (id: number): string | undefined => {
  return permissionsList.find((p) => p.id === id)?.key;
};
