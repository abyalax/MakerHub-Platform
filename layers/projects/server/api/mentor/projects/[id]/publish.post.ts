import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { idParamSchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.PUBLISH_OWN);
  const params = validate(idParamSchema, getRouterParams(event));

  return {
    message: 'Publish project successfully',
    data: await projectsService.publishProject(user, params.id),
  };
});
