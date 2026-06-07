import { projectsService } from '~/layers/projects/server/services/projects.service';
import { projectListQuerySchema } from '~/layers/projects/server/validators/projects.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => ({
  message: 'Get projects successfully',
  data: await projectsService.listPublic(validate(projectListQuerySchema, getQuery(event))),
}));
