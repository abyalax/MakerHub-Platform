import { prisma } from '~/layers/shared/server/db/prisma';
import { getCurrentUser } from '~/layers/auth/server/utils/auth';
import { idParamSchema } from '~/layers/projects/server/validators/projects.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const { id: projectId } = validate(idParamSchema, getRouterParams(event));
  const user = await getCurrentUser(event).catch(() => undefined);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      accessType: true,
      price: true,
      currency: true,
      title: true,
      slug: true,
      description: true,
      objectives: true,
      mentor: {
        select: {
          id: true,
          headline: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw createError({
      statusCode: 404,
      message: 'Project not found',
    });
  }

  let hasAccess = false;

  if (project.accessType === 'FREE') {
    hasAccess = true;
  } else if (user) {
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: user.id,
        projectId,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    hasAccess = !!entitlement;
  }

  return {
    message: 'Get project access successfully',
    data: {
      project,
      hasAccess,
    },
  };
});
