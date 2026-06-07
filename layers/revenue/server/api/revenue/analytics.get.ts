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

  const classes = await prisma.learningClass.findMany({
    where: { mentorId: mentorProfile.id },
    select: { id: true, title: true },
  });

  const analytics = await Promise.all(
    classes.map(async (cls: { id: number; title: string }) => {
      const [enrollmentCount, revenue] = await Promise.all([
        prisma.enrollment.count({
          where: { classId: cls.id },
        }),
        prisma.payment.aggregate({
          where: {
            order: {
              classId: cls.id,
              status: 'PAID',
            },
            status: 'SUCCEEDED',
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        classId: cls.id,
        classTitle: cls.title,
        enrollmentCount,
        revenue: revenue._sum?.amount?.toNumber() || 0,
      };
    })
  );

  return analytics;
});
