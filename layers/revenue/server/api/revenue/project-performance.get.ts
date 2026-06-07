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

    // Get mentor's classes
    const classes = await prisma.learningClass.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        _count: {
          select: {
            trafficEvents: true,
            enrollments: true,
          },
        },
      },
    });

    // Calculate metrics for each class
    const classMetrics = classes.map((cls) => ({
      classId: cls.id,
      classTitle: cls.title,
      totalViews: cls._count.trafficEvents,
      enrollmentCount: cls._count.enrollments,
      isPublished: cls.status === 'PUBLISHED',
    }));

    return {
      totalClasses: classes.length,
      classMetrics,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch project performance analytics',
    });
  }
});
