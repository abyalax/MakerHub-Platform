import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    // Get mentor profile for the user
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!mentorProfile) {
      throw createError({
        statusCode: 403,
        message: 'Mentor access required',
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all successful payments for mentor's classes
    const mentorClasses = await prisma.learningClass.findMany({
      where: { mentorId: mentorProfile.id },
      select: { id: true },
    });

    const classIds = mentorClasses.map((c: { id: number }) => c.id);

    // Get total sales count
    const totalSales = await prisma.order.count({
      where: {
        classId: { in: classIds },
        status: 'PAID',
      },
    });

    // Get today's revenue
    const todayRevenueResult = await prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
        paidAt: {
          gte: startOfDay,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get monthly revenue
    const monthlyRevenueResult = await prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
        paidAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get lifetime revenue
    const lifetimeRevenueResult = await prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
      },
      _sum: {
        amount: true,
      },
    });

    return {
      revenueToday: Number(todayRevenueResult._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenueResult._sum.amount || 0),
      lifetimeRevenue: Number(lifetimeRevenueResult._sum.amount || 0),
      totalSales,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch mentor earnings',
    });
  }
});
