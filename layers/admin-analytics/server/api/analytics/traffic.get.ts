import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requirePermission } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requirePermission(event, 'ADMIN');

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Get daily visitors (unique visitors in last 24 hours)
    const dailyVisitors = await prisma.visitor.count({
      where: {
        lastSeenAt: {
          gte: oneDayAgo,
        },
      },
    });

    // Get weekly visitors (unique visitors in last 7 days)
    const weeklyVisitors = await prisma.visitor.count({
      where: {
        lastSeenAt: {
          gte: oneWeekAgo,
        },
      },
    });

    // Get monthly visitors (unique visitors in last 30 days)
    const monthlyVisitors = await prisma.visitor.count({
      where: {
        lastSeenAt: {
          gte: oneMonthAgo,
        },
      },
    });

    // Get yearly visitors (unique visitors in last 365 days)
    const yearlyVisitors = await prisma.visitor.count({
      where: {
        lastSeenAt: {
          gte: oneYearAgo,
        },
      },
    });

    // Get total page views
    const totalPageViews = await prisma.trafficEvent.count();

    return {
      dailyVisitors,
      weeklyVisitors,
      monthlyVisitors,
      yearlyVisitors,
      totalPageViews,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch traffic analytics',
    });
  }
});
