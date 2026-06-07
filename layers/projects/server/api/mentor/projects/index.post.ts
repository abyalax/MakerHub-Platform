import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { projectPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.CREATE);
  const payload = validate(projectPayloadSchema, await readBody(event));

  return {
    message: 'Create project successfully',
    data: await projectsService.createProject(user, payload),
  };
});
