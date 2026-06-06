import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { rolesService } from '~/layers/users/server/services/roles.service';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ROLE.READ);

  return {
    message: 'Get permissions successfully',
    data: await rolesService.listPermissions(),
  };
});
