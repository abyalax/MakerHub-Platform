import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const projectId = Number(getRouterParam(event, 'id'));

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required',
    });
  }

  let progress = await prisma.projectProgress.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!progress) {
    progress = await prisma.projectProgress.create({
      data: {
        userId,
        projectId,
        status: 'NOT_STARTED',
        progressPercent: 0,
      },
    });
  }

  return progress;
});
