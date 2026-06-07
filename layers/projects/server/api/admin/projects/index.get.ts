import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { adminProjectListQuerySchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.PROJECT.MODERATE);

  return {
    message: 'Get admin projects successfully',
    data: await projectsService.listAdmin(validate(adminProjectListQuerySchema, getQuery(event))),
  };
});
