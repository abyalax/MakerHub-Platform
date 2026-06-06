import { userService } from '~/layers/users/server/services/users.service';
import { validate } from '~/layers/shared/server/utils/validate';
import { createUserSchema } from '~/layers/users/server/validators/users.schema';
import bcrypt from 'bcrypt';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.USER.CREATE);
  const body = await readBody(event);
  const payload = validate(createUserSchema, body);

  const created = await userService.create({
    name: payload.name,
    email: payload.email,
    password: await bcrypt.hash(payload.password, 10),
    roleIds: payload.roleIds,
  });

  return {
    message: 'Create user successfully',
    data: created,
  };
});
