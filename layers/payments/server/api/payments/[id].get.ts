import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const id = Number(getRouterParam(event, 'id'));

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Payment ID is required',
    });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id,
      userId,
    },
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
  });

  if (!payment) {
    throw createError({
      statusCode: 404,
      message: 'Payment not found',
    });
  }

  return payment;
});
