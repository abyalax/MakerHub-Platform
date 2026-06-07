import { projectsService } from '~/layers/projects/server/services/projects.service';
import { idParamSchema } from '~/layers/projects/server/validators/projects.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const params = validate(idParamSchema, getRouterParams(event));

  return {
    message: 'Get profile successfully',
    data: await projectsService.getPublicProfile(params.id),
  };
});
