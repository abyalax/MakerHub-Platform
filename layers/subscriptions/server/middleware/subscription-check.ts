import { defineEventHandler } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';

const SUBSCRIPTION_PROTECTED_PATHS = ['/api/learning', '/api/progress', '/api/lessons'];

export default defineEventHandler(async (event) => {
  if (!SUBSCRIPTION_PROTECTED_PATHS.some((path) => event.path.startsWith(path))) {
    return;
  }

  const user = await requireAuth(event);
  event.context.user = user;
  event.context.userId = user.id;

  // Check if user has an active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    include: {
      subscriptionPlan: true,
    },
  });

  if (!subscription) {
    throw createError({
      statusCode: 403,
      message: 'Active subscription required to access this content',
    });
  }

  // Attach subscription to event context for use in route handlers
  event.context.subscription = subscription;
});
