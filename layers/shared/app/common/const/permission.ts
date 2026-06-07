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
    READ_OWN: 'project:read-own',
    UPDATE_OWN: 'project:update-own',
    PUBLISH_OWN: 'project:publish-own',
    ARCHIVE_OWN: 'project:archive-own',
    MODERATE: 'project:moderate',
  },

  MENTOR: {
    READ: 'mentor:read',
    UPDATE: 'mentor:update',
    SUSPEND: 'mentor:suspend',
  },

  MEDIA: {
    CREATE: 'media:create',
    READ_OWN: 'media:read-own',
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

  // Project Management
  { id: 11, key: 'project:create', name: 'Create Project' },
  { id: 12, key: 'project:read-own', name: 'Read Own Projects' },
  { id: 13, key: 'project:update-own', name: 'Update Own Projects' },
  { id: 14, key: 'project:publish-own', name: 'Publish Own Projects' },
  { id: 15, key: 'project:archive-own', name: 'Archive Own Projects' },
  { id: 16, key: 'project:moderate', name: 'Moderate Projects' },

  // Mentor Management
  { id: 17, key: 'mentor:read', name: 'Read Mentors' },
  { id: 18, key: 'mentor:update', name: 'Update Mentor' },
  { id: 19, key: 'mentor:suspend', name: 'Suspend Mentor' },

  // Media Management
  { id: 20, key: 'media:create', name: 'Create Media Asset' },
  { id: 21, key: 'media:read-own', name: 'Read Own Media Assets' },

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
