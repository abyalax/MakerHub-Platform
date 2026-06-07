import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const body = await readBody(event);
    const { projectId } = body;

    if (!projectId) {
      throw createError({
        statusCode: 400,
        message: 'Project ID is required',
      });
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        projectId,
      },
    });

    if (existingBookmark) {
      throw createError({
        statusCode: 409,
        message: 'Bookmark already exists',
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        projectId,
      },
    });

    return bookmark;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to create bookmark',
    });
  }
});
