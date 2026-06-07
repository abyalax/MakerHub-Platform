import z from 'zod';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { sectionPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.UPDATE_OWN);
  const params = validate(paramsSchema, getRouterParams(event));
  const payload = validate(sectionPayloadSchema, await readBody(event));

  return {
    message: 'Update section successfully',
    data: await projectsService.updateSection(user, params.id, params.sectionId, payload),
  };
});
