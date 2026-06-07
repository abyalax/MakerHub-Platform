import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { idParamSchema, moderationPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.PROJECT.MODERATE);
  const params = validate(idParamSchema, getRouterParams(event));
  const payload = validate(moderationPayloadSchema, await readBody(event));

  return {
    message: 'Moderate project successfully',
    data: await projectsService.moderateProject(params.id, payload.status),
  };
});
