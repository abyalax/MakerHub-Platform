import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requirePermission } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requirePermission(event, 'ADMIN');

    // Get gross revenue (all successful payments)
    const grossRevenueResult = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
      },
      _sum: {
        amount: true,
      },
    });

    const grossRevenue = grossRevenueResult._sum.amount || 0;

    // Get net revenue (gross minus refunds)
    const refundedAmountResult = await prisma.payment.aggregate({
      where: {
        status: 'REFUNDED',
      },
      _sum: {
        amount: true,
      },
    });

    const netRevenue = Number(grossRevenue) - Number(refundedAmountResult._sum.amount || 0);

    // Get subscription revenue (payments for subscription orders)
    const subscriptionRevenueResult = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        order: {
          subscriptionPlanId: {
            not: null,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });

    const subscriptionRevenue = subscriptionRevenueResult._sum.amount || 0;

    // Get class sales revenue (payments for class orders)
    const classSalesRevenueResult = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        order: {
          classId: {
            not: null,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });

    const classSalesRevenue = classSalesRevenueResult._sum.amount || 0;

    return {
      grossRevenue: Number(grossRevenue),
      netRevenue: Number(netRevenue),
      subscriptionRevenue: Number(subscriptionRevenue),
      classSalesRevenue: Number(classSalesRevenue),
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch financial analytics',
    });
  }
});
