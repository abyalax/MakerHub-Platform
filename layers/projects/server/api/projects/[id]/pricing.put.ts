import { prisma } from '~/layers/shared/server/db/prisma';
import { requirePermission } from '~/layers/auth/server/utils/auth';
import { PERMISSIONS } from '~/layers/shared/app/common/const/permission';
import { idParamSchema } from '~/layers/projects/server/validators/projects.schema';
import { validate } from '~/layers/shared/server/utils/validate';

export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, PERMISSIONS.PROJECT.UPDATE_OWN);
  const { id: projectId } = validate(idParamSchema, getRouterParams(event));

  const body = await readBody(event);
  const { accessType, price, currency } = body;

  if (!accessType || !['FREE', 'PREMIUM'].includes(accessType)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid access type',
    });
  }

  if (accessType === 'PREMIUM') {
    if (!price || price <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Price must be greater than zero for premium projects',
      });
    }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { mentor: true },
  });

  if (!project) {
    throw createError({
      statusCode: 404,
      message: 'Project not found',
    });
  }

  if (project.authorId !== user.id && project.mentor.userId !== user.id && !user.roles.some((role) => role.name === 'Admin')) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - only project owner can modify pricing',
    });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      accessType,
      price: accessType === 'PREMIUM' ? price : 0,
      currency: currency || 'IDR',
    },
  });

  return {
    message: 'Update project pricing successfully',
    data: updatedProject,
  };
});
