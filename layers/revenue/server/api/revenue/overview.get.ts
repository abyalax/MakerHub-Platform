import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw createError({
      statusCode: 403,
      message: 'Not a mentor',
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  // Get mentor's classes
  const mentorClasses = await prisma.learningClass.findMany({
    where: { mentorId: mentorProfile.id },
    select: { id: true },
  });

  const classIds = mentorClasses.map((c: { id: number }) => c.id);

  const [totalSales, totalRevenue, todayRevenue, monthlyRevenue, lifetimeRevenue] = await Promise.all([
    prisma.order.count({
      where: {
        classId: { in: classIds },
        status: 'PAID',
      },
    }),
    prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
        paidAt: { gte: today },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
        paidAt: { gte: thisMonth },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        order: {
          classId: { in: classIds },
          status: 'PAID',
        },
        status: 'SUCCEEDED',
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalSales,
    totalRevenue: totalRevenue._sum?.amount?.toNumber() || 0,
    todayRevenue: todayRevenue._sum?.amount?.toNumber() || 0,
    monthlyRevenue: monthlyRevenue._sum?.amount?.toNumber() || 0,
    lifetimeRevenue: lifetimeRevenue._sum?.amount?.toNumber() || 0,
  };
});
