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

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Subscription plan not found',
      });
    }

    return plan;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch subscription plan',
    });
  }
});
