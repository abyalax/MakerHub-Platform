import bcrypt from 'bcrypt';
import { createError } from 'h3';
import { loginSchema } from '~/layers/auth/server/validators/auth.schema';
import { setAuthCookies } from '~/layers/auth/server/utils/auth';
import { validate } from '~/layers/shared/server/utils/validate';
import { userService } from '~/layers/users/server/services/users.service';

export default defineEventHandler(async (event) => {
  const payload = validate(loginSchema, await readBody(event));

  const userWithPassword = await userService.findUser({ email: payload.email }).catch(() => undefined);

  if (!userWithPassword?.password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  const isValidPassword = await bcrypt.compare(payload.password, userWithPassword.password);

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  await setAuthCookies(event, userWithPassword);

  return {
    message: 'Login successfully',
    data: {
      ...userWithPassword,
      password: undefined,
    },
  };
});
