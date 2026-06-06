import { userService } from '~/layers/users/server/services/users.service';
import { idParamSchema } from '~/layers/users/server/validators/users.schema';
import { validate } from '~/layers/shared/server/utils/validate';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.USER.READ);
  const params = validate(idParamSchema, {
    id: getRouterParam(event, 'id'),
  });

  return {
    message: 'Get user successfully',
    data: await userService.findById(params.id),
  };
});
