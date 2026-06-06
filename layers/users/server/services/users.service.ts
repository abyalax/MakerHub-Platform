import type { Prisma } from '~/generated/prisma/client';
import { UserRepository } from '~/layers/users/server/repositories/users.repository';
import { Service } from '~/layers/shared/server/abstract/services';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type { CreateUserPayload, UpdateUserPayload, User } from '~/layers/users/types/index';
import { UserMapper, type UserRoles } from '~/layers/users/server/validators/users.dto';
import { prisma } from '~/layers/shared/server/db/prisma';
import { createError } from 'h3';

const userInclude = {
  user_roles: {
    include: {
      role: {
        include: {
          role_permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

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
      searchBy: ['name', 'email'],
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

  if (code === 'P2002') {
    throw createError({ statusCode: 409, statusMessage: 'Conflict', message: 'Email already exists' });
  }
  if (code === 'P2025') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'User not found' });
  }

  throw error;
};

class UserService extends Service<UserRepository> {
  constructor() {
    super(new UserRepository());
  }
  _getRepository = () => this.repository;
  _getModel = () => this._getModel;

  async list(params: MetaRequest<User> & { limit?: number; role_id?: number }, where: Prisma.UserWhereInput = {}): Promise<Paginated<User>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = params.search ?? '';
    const sortBy = params.sort_by && ['id', 'name', 'email'].includes(String(params.sort_by)) ? String(params.sort_by) : 'id';
    const sortOrder = String(params.sort_order ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    const cacheKey = JSON.stringify(params);

    const cached = await this.repository.cache.get(cacheKey);
    if (cached) return cached as Paginated<User>;

    const roleFilter = params.role_id
      ? {
          user_roles: {
            some: {
              role_id: Number(params.role_id),
            },
          },
        }
      : {};

    const searchFilter: Prisma.UserWhereInput = search
      ? {
          OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
        }
      : {};

    const finalWhere: Prisma.UserWhereInput = {
      AND: [where, roleFilter, searchFilter],
    };
    const orderBy = {
      [sortBy]: sortOrder,
    } as Prisma.UserOrderByWithRelationInput;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: finalWhere,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: userInclude,
      }),
      prisma.user.count({ where: finalWhere }),
    ]);

    const mapped = items.map((e) => UserMapper.toDTO(e as UserRoles, false));
    const result = toPaginated(mapped, page, limit, total, search, sortBy, sortOrder);

    this.repository.cache.set(cacheKey, result, { ttl: 600 });
    return result;
  }

  findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  async findById(id: number, withPassword: boolean = false) {
    const cached = await this.repository.cache.get(String(id));
    if (cached) return cached as User;

    const data = await this.repository.findWithRolesAndPermissions({ id }, withPassword);

    this.repository.cache.set(String(id), data, { ttl: 600 });

    return data;
  }

  findUser(where: Prisma.UserWhereUniqueInput) {
    return this.repository.findWithRolesAndPermissions(where);
  }

  async create(data: CreateUserPayload) {
    try {
      const { roleIds, ...userData } = data;
      const created = await prisma.user.create({ data: userData });
      await this.syncRoles(created.id, roleIds);
      this.repository.cache.delete(JSON.stringify({}));
      return this.findById(created.id);
    } catch (error) {
      toHttpError(error);
    }
  }

  async update(id: number, data: UpdateUserPayload) {
    try {
      const { roleIds, ...userData } = data;
      await prisma.user.update({ where: { id }, data: userData });
      if (roleIds !== undefined) await this.syncRoles(id, roleIds);
      this.repository.cache.delete(String(id));
      return this.findById(id);
    } catch (error) {
      toHttpError(error);
    }
  }

  async delete(id: number) {
    try {
      const deleted = await prisma.user.delete({ where: { id } });
      this.repository.cache.delete(String(id));
      return deleted;
    } catch (error) {
      toHttpError(error);
    }
  }

  async syncRoles(userId: number, roleIds?: number[]) {
    if (roleIds === undefined) return;

    await prisma.$transaction([
      prisma.userRoles.deleteMany({ where: { user_id: userId } }),
      ...(roleIds.length
        ? [
            prisma.userRoles.createMany({
              data: roleIds.map((roleId) => ({
                user_id: userId,
                role_id: roleId,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  }
}

export const userService = new UserService();
