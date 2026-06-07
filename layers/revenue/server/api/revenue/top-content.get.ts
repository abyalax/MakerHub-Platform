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

    // Get mentor's classes with traffic metrics
    const classes = await prisma.learningClass.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        _count: {
          select: {
            trafficEvents: true,
          },
        },
      },
    });

    // Get payments for mentor's classes through orders
    const classIds = classes.map((c) => c.id);
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
      },
      include: {
        order: {
          select: {
            classId: true,
          },
        },
      },
    });

    // Calculate revenue for each class
    const classRevenue = new Map<number, number>();
    payments.forEach((payment) => {
      const classId = payment.order.classId;
      if (classId) {
        classRevenue.set(classId, (classRevenue.get(classId) || 0) + Number(payment.amount));
      }
    });

    // Calculate metrics for each class
    const topContent = classes
      .map((cls) => ({
        classId: cls.id,
        classTitle: cls.title,
        views: cls._count.trafficEvents,
        revenue: classRevenue.get(cls.id) || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return topContent;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch top content analytics',
    });
  }
});
