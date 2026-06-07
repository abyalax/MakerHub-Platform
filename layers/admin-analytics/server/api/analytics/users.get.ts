import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';

export default defineEventHandler(async (event) => {
  try {
    await requirePermission(event, PERMISSIONS.USER.READ);

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total learners (users without mentor profile)
    const totalLearners = await prisma.user.count({
      where: {
        mentorProfile: null,
      },
    });

    // Get total mentors
    const totalMentors = await prisma.mentorProfile.count();

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get new registrations (last 30 days)
    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      totalLearners,
      totalMentors,
      activeUsers,
      newRegistrations,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch user analytics',
    });
  }
});
