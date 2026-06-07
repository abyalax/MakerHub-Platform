import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { projectListQuerySchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.MENTOR.READ);

  return {
    message: 'Get mentors successfully',
    data: await projectsService.listMentors(validate(projectListQuerySchema, getQuery(event))),
  };
});
