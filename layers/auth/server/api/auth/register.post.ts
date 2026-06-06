import bcrypt from 'bcrypt';
import { createError } from 'h3';
import { registerSchema } from '~/layers/auth/server/validators/auth.schema';
import { validate } from '~/layers/shared/server/utils/validate';
import { prisma } from '~/layers/shared/server/db/prisma';
import { userService } from '~/layers/users/server/services/users.service';

export default defineEventHandler(async (event) => {
  const payload = validate(registerSchema, await readBody(event));
  const userRole = await prisma.role.findUnique({ where: { name: 'User' } });

  if (!userRole) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Default role User is not configured',
    });
  }

  const user = await userService.create({
    name: payload.name,
    email: payload.email,
    password: await bcrypt.hash(payload.password, 10),
    roleIds: [userRole.id],
  });

  return {
    message: 'Register successfully',
    data: user,
  };
});
