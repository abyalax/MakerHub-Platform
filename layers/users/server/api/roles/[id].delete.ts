import { setResponseStatus } from 'h3';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';
import { rolesService } from '~/layers/users/server/services/roles.service';
import { idParamSchema } from '~/layers/users/server/validators/users.schema';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLE.DELETE);
  const params = validate(idParamSchema, { id: getRouterParam(event, 'id') });

  await rolesService.delete(params.id);

  setResponseStatus(event, 204);
  return null;
});
