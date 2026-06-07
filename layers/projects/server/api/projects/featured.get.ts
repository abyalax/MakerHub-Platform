import { projectsService } from '~/layers/projects/server/services/projects.service';

export default defineEventHandler(async () => ({
  message: 'Get featured projects successfully',
  data: await projectsService.listFeatured(),
}));
