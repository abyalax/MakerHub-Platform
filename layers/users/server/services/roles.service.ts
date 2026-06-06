import { createError } from 'h3';
import type { Prisma } from '~/generated/prisma/client';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import { prisma } from '~/layers/shared/server/db/prisma';
import type { Permission, Role } from '~/layers/users/types';

type RoleWithPermissions = Prisma.RoleModel & {
  role_permissions: {
    permission: Prisma.PermissionsModel;
  }[];
};

type RolePayload = {
  name: string;
  permissionIds?: number[];
};

type UpdateRolePayload = Partial<RolePayload>;

const roleInclude = {
  role_permissions: {
    include: {
      permission: true,
    },
  },
} satisfies Prisma.RoleInclude;

const mapRole = (role: RoleWithPermissions): Role => ({
  id: role.id,
  name: role.name,
  permissions: role.role_permissions.map((rolePermission) => ({
    id: rolePermission.permission.id,
    key: rolePermission.permission.key,
    name: rolePermission.permission.name,
  })),
});

const toPaginated = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  search = '',
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Paginated<T> => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    data,
    meta: {
      itemsPerPage: limit,
      totalItems: total,
      currentPage: page,
      totalPages,
      sortBy: sortBy && sortOrder ? [[sortBy, sortOrder]] : [],
      searchBy: ['name'],
      search,
      select: [],
    },
    links: {
      current: `?page=${page}&limit=${limit}`,
      first: `?page=1&limit=${limit}`,
      previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : undefined,
      next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : undefined,
      last: `?page=${totalPages}&limit=${limit}`,
    },
  };
};

const toHttpError = (error: unknown) => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: string }).code) : undefined;

  if (code === 'P2002') throw createError({ statusCode: 409, statusMessage: 'Conflict', message: 'Role already exists' });
  if (code === 'P2025') throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Role not found' });

  throw error;
};

class RolesService {
  async list(params: MetaRequest<Role> & { limit?: number }): Promise<Paginated<Role>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = params.search ?? '';
    const sortBy = params.sort_by && ['id', 'name'].includes(String(params.sort_by)) ? String(params.sort_by) : 'id';
    const sortOrder = String(params.sort_order ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    const where: Prisma.RoleWhereInput = search ? { name: { contains: search, mode: 'insensitive' } } : {};

    const [items, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
        include: roleInclude,
      }),
      prisma.role.count({ where }),
    ]);

    return toPaginated(
      items.map((role) => mapRole(role as RoleWithPermissions)),
      page,
      limit,
      total,
      search,
      sortBy,
      sortOrder
    );
  }

  async findById(id: number) {
    try {
      const role = await prisma.role.findUniqueOrThrow({
        where: { id },
        include: roleInclude,
      });

      return mapRole(role as RoleWithPermissions);
    } catch (error) {
      toHttpError(error);
    }
  }

  async create(payload: RolePayload) {
    try {
      const { permissionIds, name } = payload;
      const role = await prisma.role.create({ data: { name } });
      await this.syncPermissions(role.id, permissionIds ?? []);
      return this.findById(role.id);
    } catch (error) {
      toHttpError(error);
    }
  }

  async update(id: number, payload: UpdateRolePayload) {
    try {
      if (payload.name) await prisma.role.update({ where: { id }, data: { name: payload.name } });
      if (payload.permissionIds !== undefined) await this.syncPermissions(id, payload.permissionIds);
      return this.findById(id);
    } catch (error) {
      toHttpError(error);
    }
  }

  async delete(id: number) {
    const usersCount = await prisma.userRoles.count({ where: { role_id: id } });

    if (usersCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'Role is assigned to users',
      });
    }

    try {
      await prisma.rolePermissions.deleteMany({ where: { role_id: id } });
      await prisma.role.delete({ where: { id } });
    } catch (error) {
      toHttpError(error);
    }
  }

  async listPermissions(): Promise<Permission[]> {
    return prisma.permissions.findMany({
      orderBy: {
        key: 'asc',
      },
    });
  }

  private async syncPermissions(roleId: number, permissionIds: number[]) {
    await prisma.$transaction([
      prisma.rolePermissions.deleteMany({ where: { role_id: roleId } }),
      ...(permissionIds.length
        ? [
            prisma.rolePermissions.createMany({
              data: permissionIds.map((permissionId) => ({
                role_id: roleId,
                permission_id: permissionId,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  }
}

export const rolesService = new RolesService();
