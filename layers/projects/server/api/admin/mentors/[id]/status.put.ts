import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { idParamSchema, mentorStatusPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.MENTOR.SUSPEND);
  const params = validate(idParamSchema, getRouterParams(event));
  const payload = validate(mentorStatusPayloadSchema, await readBody(event));

  return {
    message: 'Update mentor status successfully',
    data: await projectsService.setMentorStatus(params.id, payload),
  };
});
