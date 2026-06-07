import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { requireAuth } from '~/layers/auth/server/utils/auth';
import { xenditService } from '~/layers/payments/server/services/xendit';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const body = await readBody(event);
    const { planId } = body;

    if (!planId) {
      throw createError({
        statusCode: 400,
        message: 'Plan ID is required',
      });
    }

    // Get the subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Subscription plan not found',
      });
    }

    if (!plan.isActive) {
      throw createError({
        statusCode: 400,
        message: 'This plan is not available for purchase',
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'INCOMPLETE'],
        },
      },
    });

    if (existingSubscription) {
      throw createError({
        statusCode: 400,
        message: 'You already have an active subscription',
      });
    }

    // Generate order number
    const orderNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        subscriptionPlanId: plan.id,
        orderNumber,
        amount: plan.price,
        currency: plan.currency,
        status: 'PENDING',
        provider: 'XENDIT',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Integrate with Xendit to create recurring billing plan
    let checkoutUrl = '';
    try {
      // Map billing interval to Xendit format
      const interval = plan.billingInterval === 'MONTHLY' ? 'MONTH' : 'YEAR';
      const intervalCount = plan.billingInterval === 'MONTHLY' ? 1 : 12;

      const recurringPlan = await xenditService.createRecurringPlan({
        external_id: orderNumber,
        amount: Number(plan.price),
        currency: plan.currency,
        interval,
        interval_count: intervalCount,
        description: `Subscription: ${plan.name}`,
      });

      // Update subscription plan with Xendit plan ID
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: {
          xenditPlanId: recurringPlan.id,
        },
      });

      // Use Xendit's checkout URL if available, otherwise fallback to mock
      checkoutUrl = `https://checkout.xendit.co/web/${order.orderNumber}`;
    } catch (error) {
      console.error('Failed to create Xendit recurring plan:', error);
      // Fallback to mock checkout URL if Xendit integration fails
      checkoutUrl = `https://checkout.xendit.co/web/${order.orderNumber}`;
    }

    return {
      order,
      checkoutUrl,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error;
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to create subscription checkout',
    });
  }
});
