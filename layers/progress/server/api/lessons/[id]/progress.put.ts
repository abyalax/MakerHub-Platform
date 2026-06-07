import { defineEventHandler, readBody } from 'h3';
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

  const body = await readBody(event);
  const { status } = body;

  if (!status || !['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status',
    });
  }

  const completedAt = status === 'COMPLETED' ? new Date() : null;

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      status,
      completedAt,
    },
    create: {
      userId,
      lessonId,
      status,
      completedAt,
    },
  });

  // Get lesson to find project
  const lesson = await prisma.projectLesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          project: true,
        },
      },
    },
  });

  if (lesson) {
    const projectId = lesson.section.project.id;

    // Calculate project progress
    const allLessons = await prisma.projectLesson.findMany({
      where: {
        section: {
          projectId,
        },
      },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: {
          in: allLessons.map((l: { id: number }) => l.id),
        },
        status: 'COMPLETED',
      },
    });

    const progressPercent = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0;

    const projectStatus = progressPercent === 0 ? 'NOT_STARTED' : progressPercent === 100 ? 'COMPLETED' : 'IN_PROGRESS';

    // Update project progress
    await prisma.projectProgress.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      update: {
        status: projectStatus,
        progressPercent,
        completedAt: projectStatus === 'COMPLETED' ? new Date() : null,
      },
      create: {
        userId,
        projectId,
        status: projectStatus,
        progressPercent,
        startedAt: projectStatus === 'IN_PROGRESS' || projectStatus === 'COMPLETED' ? new Date() : null,
        completedAt: projectStatus === 'COMPLETED' ? new Date() : null,
      },
    });

    // Update enrollment progress
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: projectId, // Using projectId as classId due to schema mismatch
        },
      },
    });

    if (enrollment) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercent,
          completedAt: projectStatus === 'COMPLETED' ? new Date() : null,
        },
      });
    }
  }

  return progress;
});
