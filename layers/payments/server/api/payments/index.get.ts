import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = event.context.userId;

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const status = (query.status as string) || undefined;

  const where: Record<string, unknown> = {
    userId,
  };

  if (status) {
    where.status = status;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            class: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
});
