import type { Prisma } from '~/generated/prisma/client';
import { Repository } from '~/layers/shared/server/abstract/repositories';
import { prisma } from '~/layers/shared/server/db/prisma';
import { UserMapper } from '../validators/users.dto';
import { MemoryCache } from '~/layers/shared/server/abstract/cache';

const memoryCache = new MemoryCache();

export class UserRepository extends Repository<Prisma.UserDelegate, Prisma.UserWhereInput, Prisma.UserOrderByWithRelationInput> {
  constructor() {
    super(prisma.user, memoryCache);
  }

  override _getModel() {
    return this.model;
  }

  findByEmail(email: string) {
    return this.model.findUniqueOrThrow({
      where: { email },
    });
  }

  async findWithRolesAndPermissions(where: Prisma.UserWhereUniqueInput, withPassword: boolean = true) {
    const user = await prisma.user.findUniqueOrThrow({
      where,
      include: {
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
      },
    });
    return UserMapper.toDTO(user, withPassword);
  }
}
