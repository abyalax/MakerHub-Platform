import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const id = Number.parseInt(event.context.params?.id || '0');

    if (Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid plan ID',
      });
    }

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        subscriptions: true,
      },
    });

    if (!existingPlan) {
      throw createError({
        statusCode: 404,
        message: 'Subscription plan not found',
      });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = existingPlan.subscriptions.filter((s) => s.status === 'ACTIVE' || s.status === 'INCOMPLETE');

    if (activeSubscriptions.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete plan with active subscriptions',
      });
    }

    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to delete subscription plan',
    });
  }
});
