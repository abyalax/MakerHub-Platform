import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const id = Number.parseInt(event.context.params?.id || '0');

    if (Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid bookmark ID',
      });
    }

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark) {
      throw createError({
        statusCode: 404,
        message: 'Bookmark not found',
      });
    }

    if (bookmark.userId !== user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete this bookmark',
      });
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to delete bookmark',
    });
  }
});
