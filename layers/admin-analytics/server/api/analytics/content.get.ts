import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requirePermission } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requirePermission(event, 'ADMIN');

    // Get total projects
    const totalProjects = await prisma.project.count();

    // Get published projects
    const publishedProjects = await prisma.project.count({
      where: {
        status: 'PUBLISHED',
      },
    });

    // Get draft projects
    const draftProjects = await prisma.project.count({
      where: {
        status: 'DRAFT',
      },
    });

    // Get free projects
    const freeProjects = await prisma.project.count({
      where: {
        accessType: 'FREE',
      },
    });

    // Get premium projects
    const premiumProjects = await prisma.project.count({
      where: {
        accessType: 'PREMIUM',
      },
    });

    return {
      totalProjects,
      publishedProjects,
      draftProjects,
      freeProjects,
      premiumProjects,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch content analytics',
    });
  }
});
