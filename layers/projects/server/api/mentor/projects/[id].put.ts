import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { idParamSchema, updateProjectPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.UPDATE_OWN);
  const params = validate(idParamSchema, getRouterParams(event));
  const payload = validate(updateProjectPayloadSchema, await readBody(event));

  return {
    message: 'Update project successfully',
    data: await projectsService.updateProject(user, params.id, payload),
  };
});
