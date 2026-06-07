import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const user = await requireAuth(event);

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!mentorProfile) {
    throw createError({
      statusCode: 403,
      message: 'Not a mentor',
    });
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const status = query.status as string;

  // Get mentor's classes
  const classIds = (
    await prisma.learningClass.findMany({
      where: { mentorId: mentorProfile.id },
      select: { id: true },
    })
  ).map((c: { id: number }) => c.id);

  const where: Record<string, unknown> = {
    order: {
      classId: { in: classIds },
    },
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
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            class: {
              select: {
                id: true,
                title: true,
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

  const transactions = payments.map((payment) => ({
    id: payment.id,
    classId: payment.order.class?.id || null,
    classTitle: payment.order.class?.title || 'Unknown',
    learnerName: payment.order.user.name,
    amount: payment.amount.toNumber(),
    currency: payment.currency,
    status: payment.status,
    purchaseDate: payment.createdAt,
  }));

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
});
