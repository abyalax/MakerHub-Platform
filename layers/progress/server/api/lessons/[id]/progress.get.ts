import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const lessonId = Number(getRouterParam(event, 'id'));

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  if (!lessonId) {
    throw createError({
      statusCode: 400,
      message: 'Lesson ID is required',
    });
  }

  let progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });

  if (!progress) {
    progress = await prisma.lessonProgress.create({
      data: {
        userId,
        lessonId,
        status: 'NOT_STARTED',
      },
    });
  }

  return progress;
});
