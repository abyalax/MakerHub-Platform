import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { xenditService } from '~/layers/payments/server/services/xendit';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const headers = getRequestHeaders(event);
  const config = useRuntimeConfig();
  const webhookToken = config.xenditWebhookToken;

  // Verify webhook signature
  const signature = headers['x-callback-token'] as string;

  if (!signature || !webhookToken) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const isValid = await xenditService.verifyWebhookSignature(JSON.stringify(body), signature, webhookToken);

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid signature',
    });
  }

  // Check for duplicate events
  const { event_id, event_type } = body;

  if (!event_id || !event_type) {
    throw createError({
      statusCode: 400,
      message: 'Invalid webhook payload',
    });
  }

  // Check if event already processed
  const existingEvent = await prisma.providerWebhookEvent.findUnique({
    where: { eventId: event_id },
  });

  if (existingEvent) {
    return { status: 'already_processed' };
  }

  // Handle different event types
  switch (event_type) {
    case 'invoice.paid':
      await xenditService.handleInvoicePaid(body);
      break;
    case 'invoice.expired':
      await xenditService.handleInvoiceExpired(body);
      break;
    case 'invoice.failed':
      await xenditService.handleInvoiceFailed(body);
      break;
    default:
      console.log('Unhandled webhook event type:', event_type);
  }

  return { status: 'success' };
});
