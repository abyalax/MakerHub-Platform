import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        project: {
          include: {
            coverAsset: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get progress for each bookmarked project
    const bookmarksWithProgress = await Promise.all(
      bookmarks.map(async (bookmark) => {
        if (!bookmark.projectId) return { ...bookmark, isFavorite: false };

        const progress = await prisma.projectProgress.findUnique({
          where: {
            userId_projectId: {
              userId: user.id,
              projectId: bookmark.projectId,
            },
          },
        });

        return {
          ...bookmark,
          progress: progress
            ? {
                progressPercent: Number(progress.progressPercent),
                lastAccessed: progress.updatedAt,
              }
            : null,
          isFavorite: false,
        };
      })
    );

    return bookmarksWithProgress;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
    });
  }
});
