import { requirePermission } from '~/layers/auth/server/utils/auth';
import { idParamSchema, sectionPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.UPDATE_OWN);
  const params = validate(idParamSchema, getRouterParams(event));
  const payload = validate(sectionPayloadSchema, await readBody(event));

  return {
    message: 'Create section successfully',
    data: await projectsService.createSection(user, params.id, payload),
  };
});
