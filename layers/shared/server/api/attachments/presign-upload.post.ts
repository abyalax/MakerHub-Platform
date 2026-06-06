import { requireAuth } from '~/layers/auth/server/utils/auth';
import { attachmentsService } from '~/layers/shared/server/services/attachments.service';
import { requestPresignedUploadSchema } from '~/layers/shared/server/validators/attachments.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const payload = validate(requestPresignedUploadSchema, await readBody(event));

  return {
    message: 'Presigned upload URL generated successfully',
    data: await attachmentsService.requestPresignedUpload(payload),
  };
});
