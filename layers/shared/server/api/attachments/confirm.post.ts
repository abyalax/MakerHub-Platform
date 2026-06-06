import { requireAuth } from '~/layers/auth/server/utils/auth';
import { attachmentsService } from '~/layers/shared/server/services/attachments.service';
import { confirmUploadSchema } from '~/layers/shared/server/validators/attachments.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const payload = validate(confirmUploadSchema, await readBody(event));

  return {
    message: 'Attachment confirmed successfully',
    data: await attachmentsService.confirmUpload(payload),
  };
});
