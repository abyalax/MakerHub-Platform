import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';
import { rolesService } from '~/layers/users/server/services/roles.service';
import { idParamSchema, updateRolePayloadSchema } from '~/layers/users/server/validators/users.schema';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLE.UPDATE);
  const params = validate(idParamSchema, { id: getRouterParam(event, 'id') });
  const payload = validate(updateRolePayloadSchema, await readBody(event));

  return {
    message: 'Update role successfully',
    data: await rolesService.update(params.id, payload),
  };
});
