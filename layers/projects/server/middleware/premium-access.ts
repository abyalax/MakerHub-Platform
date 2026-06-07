import { prisma } from '~/layers/shared/server/db/prisma';
import { getCurrentUser } from '~/layers/auth/server/utils/auth';

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, 'id'));

  if (!projectId) {
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { accessType: true },
  });

  if (!project || project.accessType === 'FREE') {
    return;
  }

  const user = await getCurrentUser(event).catch(() => undefined);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required for premium content',
    });
  }

  const entitlement = await prisma.entitlement.findFirst({
    where: {
      userId: user.id,
      projectId,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
  });

  if (!entitlement) {
    throw createError({
      statusCode: 403,
      message: 'Premium access required',
    });
  }
});
