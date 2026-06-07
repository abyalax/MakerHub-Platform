import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const id = Number.parseInt(event.context.params?.id || '0');

    if (Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid plan ID',
      });
    }

    const body = await readBody(event);
    const { name, description, price, currency, billingInterval, isActive } = body;

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw createError({
        statusCode: 404,
        message: 'Subscription plan not found',
      });
    }

    // Update slug if name changed
    let slug = existingPlan.slug;
    if (name && name !== existingPlan.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug conflicts
      const slugConflict = await prisma.subscriptionPlan.findUnique({
        where: { slug },
      });

      if (slugConflict && slugConflict.id !== id) {
        throw createError({
          statusCode: 409,
          message: 'Subscription plan with this name already exists',
        });
      }
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug !== existingPlan.slug && { slug }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(billingInterval && { billingInterval }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return plan;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to update subscription plan',
    });
  }
});
