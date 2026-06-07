import { projectsService } from '~/layers/projects/server/services/projects.service';

export default defineEventHandler(async () => ({
  message: 'Get categories successfully',
  data: await projectsService.listCategories(),
}));
