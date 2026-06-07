import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, description, price, currency, billingInterval, isActive } = body;

    // Validate required fields
    if (!name || !price || !billingInterval) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields',
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });

    if (existingPlan) {
      throw createError({
        statusCode: 409,
        message: 'Subscription plan with this name already exists',
      });
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        currency: currency || 'IDR',
        billingInterval,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return plan;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to create subscription plan',
    });
  }
});
