import { getCurrentUser } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { slugParamSchema } from '~/layers/projects/server/validators/projects.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const params = validate(slugParamSchema, getRouterParams(event));
  const user = await getCurrentUser(event).catch(() => undefined);

  return {
    message: 'Get project successfully',
    data: await projectsService.getPublicBySlug(params.slug, user),
  };
});
