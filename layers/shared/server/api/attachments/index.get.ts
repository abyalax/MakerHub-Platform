import { requireAuth } from '~/layers/auth/server/utils/auth';
import { attachmentsService } from '~/layers/shared/server/services/attachments.service';
import { attachmentListQuerySchema } from '~/layers/shared/server/validators/attachments.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const query = validate(attachmentListQuerySchema, getQuery(event));

  return {
    message: 'Attachments fetched successfully',
    data: await attachmentsService.list(query),
  };
});
