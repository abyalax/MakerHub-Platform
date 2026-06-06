import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';
import { rolesService } from '~/layers/users/server/services/roles.service';
import { rolePayloadSchema } from '~/layers/users/server/validators/users.schema';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLE.CREATE);
  const payload = validate(rolePayloadSchema, await readBody(event));

  return {
    message: 'Create role successfully',
    data: await rolesService.create(payload),
  };
});
