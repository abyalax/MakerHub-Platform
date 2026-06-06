import { requireAuth } from '~/layers/auth/server/utils/auth';
import { attachmentsService } from '~/layers/shared/server/services/attachments.service';
import { attachmentIdParamSchema } from '~/layers/shared/server/validators/attachments.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const params = validate(attachmentIdParamSchema, { id: getRouterParam(event, 'id') });

  return {
    message: 'Attachment download URL generated successfully',
    data: await attachmentsService.getDownload(params.id),
  };
});
