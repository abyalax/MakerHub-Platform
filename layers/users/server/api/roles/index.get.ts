import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';
import { rolesService } from '~/layers/users/server/services/roles.service';
import { userQuerySchema } from '~/layers/users/server/validators/users.schema';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLE.READ);
  const query = validate(userQuerySchema, getQuery(event));

  return {
    message: 'Get roles successfully',
    data: await rolesService.list(query),
  };
});
