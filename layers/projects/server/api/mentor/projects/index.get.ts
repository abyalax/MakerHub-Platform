import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { projectListQuerySchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.READ_OWN);

  return {
    message: 'Get mentor projects successfully',
    data: await projectsService.listMine(user, validate(projectListQuerySchema, getQuery(event))),
  };
});
