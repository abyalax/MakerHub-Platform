import { userService } from '~/layers/users/server/services/users.service';
import { idParamSchema, updateUserSchema } from '~/layers/users/server/validators/users.schema';
import { validate } from '~/layers/shared/server/utils/validate';
import bcrypt from 'bcrypt';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import type { UpdateUserPayload } from '~/layers/users/types';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.USER.UPDATE);
  const params = validate(idParamSchema, {
    id: getRouterParam(event, 'id'),
  });

  const body = await readBody(event);
  const payload = validate(updateUserSchema, body);

  const dataToUpdate: UpdateUserPayload = {};
  if (payload.name) dataToUpdate.name = payload.name;
  if (payload.email) dataToUpdate.email = payload.email;
  if (payload.roleIds !== undefined) dataToUpdate.roleIds = payload.roleIds;
  if (payload.password) {
    dataToUpdate.password = await bcrypt.hash(payload.password, 10);
  }

  const updated = await userService.update(params.id, dataToUpdate);

  return {
    message: 'Update user successfully',
    data: updated,
  };
});
