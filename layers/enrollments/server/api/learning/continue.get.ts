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

  // Find the most recently accessed lesson
  const recentProgress = await prisma.lessonProgress.findFirst({
    where: {
      userId,
      status: 'IN_PROGRESS',
    },
    include: {
      lesson: {
        include: {
          section: {
            include: {
              project: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (!recentProgress) {
    return {
      projectId: null,
      lessonId: null,
      lessonTitle: null,
      projectTitle: null,
      projectSlug: null,
    };
  }

  return {
    projectId: recentProgress.lesson.section.project.id,
    lessonId: recentProgress.lesson.id,
    lessonTitle: recentProgress.lesson.title,
    projectTitle: recentProgress.lesson.section.project.title,
    projectSlug: recentProgress.lesson.section.project.slug,
  };
});
