import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';
import { xenditService } from '~/layers/payments/server/services/xendit';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const id = Number.parseInt(event.context.params?.id || '0');

    if (Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid subscription ID',
      });
    }

    // Get the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true,
      },
    });

    if (!subscription) {
      throw createError({
        statusCode: 404,
        message: 'Subscription not found',
      });
    }

    // Check if user owns this subscription
    if (subscription.userId !== user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to cancel this subscription',
      });
    }

    // Check if subscription is already canceled
    if (subscription.status === 'CANCELED' || subscription.status === 'EXPIRED') {
      throw createError({
        statusCode: 400,
        message: 'Subscription is already canceled or expired',
      });
    }

    // Cancel subscription with Xendit if it has a provider external ID
    if (subscription.providerExternalId) {
      try {
        await xenditService.cancelSubscription(subscription.providerExternalId);
      } catch (error) {
        console.error('Failed to cancel subscription with Xendit:', error);
        // Continue with local cancellation even if Xendit cancellation fails
      }
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
      include: {
        subscriptionPlan: true,
      },
    });

    // Log cancellation event
    await prisma.providerWebhookEvent.create({
      data: {
        provider: 'XENDIT',
        eventId: `CANCEL-${id}-${Date.now()}`,
        eventType: 'subscription.canceled',
        payload: {
          subscriptionId: id,
          userId: user.id,
          canceledAt: new Date().toISOString(),
        },
        processedAt: new Date(),
      },
    });

    return updatedSubscription;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to cancel subscription',
    });
  }
});
