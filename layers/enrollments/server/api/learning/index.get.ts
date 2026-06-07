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

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
    include: {
      class: {
        include: {
          coverAsset: {
            select: {
              id: true,
              publicUrl: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  const classes = enrollments.map((enrollment) => ({
    id: enrollment.class.id,
    title: enrollment.class.title,
    slug: enrollment.class.slug,
    progressPercent: enrollment.progressPercent,
    lastAccessed: enrollment.enrolledAt,
    status: enrollment.status,
    coverAsset: enrollment.class.coverAsset,
  }));

  return classes;
});
