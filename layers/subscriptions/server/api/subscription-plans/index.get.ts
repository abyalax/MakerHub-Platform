import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async () => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    return plans;
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch subscription plans',
    });
  }
});
