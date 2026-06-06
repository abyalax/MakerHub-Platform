import type { Prisma } from '~/generated/prisma/client';
import type { User, Permission } from '~/layers/users/types';

export type UserRoles = Prisma.UserModel & {
  user_roles: {
    role: {
      role_permissions: ({
        permission: Prisma.PermissionsModel;
      } & Prisma.RolePermissionsModel)[];
    } & Prisma.RoleModel;
  }[];
};

export const UserMapper = {
  toDTO: (user: UserRoles, withPassword: boolean = false): User => {
    const roles: User['roles'] = [];
    const permissionsMap = new Map<number, Permission>();

    user.user_roles.forEach((ur) => {
      const role = ur.role;
      const rolePermissions: Permission[] = [];

      role.role_permissions.forEach((rp) => {
        const p = rp.permission;
        const permission = {
          id: p.id,
          key: p.key,
          name: p.name,
        };

        rolePermissions.push(permission);
        if (!permissionsMap.has(p.id)) {
          permissionsMap.set(p.id, permission);
        }
      });

      roles.push({
        id: role.id,
        name: role.name,
        permissions: rolePermissions,
      });
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: withPassword ? user.password : undefined,
      roles,
      permissions: Array.from(permissionsMap.values()),
    };
  },
};
