import { requirePermission } from '~/layers/auth/server/utils/auth';
import { projectsService } from '~/layers/projects/server/services/projects.service';
import { mediaAssetPayloadSchema } from '~/layers/projects/server/validators/projects.schema';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.MEDIA.CREATE);
  const payload = validate(mediaAssetPayloadSchema, await readBody(event));

  return {
    message: 'Create media asset successfully',
    data: await projectsService.createMediaAsset(user, payload),
  };
});
