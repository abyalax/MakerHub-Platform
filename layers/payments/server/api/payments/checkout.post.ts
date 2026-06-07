import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { xenditService } from '~/layers/payments/server/services/xendit';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const config = useRuntimeConfig();
  const appUrl = config.appUrl;

  if (!appUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      message: 'Application URL is not configured',
    });
  }

  const body = await readBody(event);
  const { projectId } = body;

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required',
    });
  }

  // Check if project exists and is premium
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw createError({
      statusCode: 404,
      message: 'Project not found',
    });
  }

  if (project.accessType !== 'PREMIUM') {
    throw createError({
      statusCode: 400,
      message: 'Project is not premium',
    });
  }

  // Check if user already has access
  const existingEntitlement = await prisma.entitlement.findFirst({
    where: {
      userId,
      projectId,
      expiresAt: { gte: new Date() },
    },
  });

  if (existingEntitlement) {
    throw createError({
      statusCode: 400,
      message: 'User already has access to this project',
    });
  }

  // Get first class for this project
  const firstClass = await prisma.learningClass.findFirst({
    where: {
      projects: {
        some: {
          projectId,
        },
      },
    },
  });

  if (!firstClass) {
    throw createError({
      statusCode: 400,
      message: 'Project has no classes',
    });
  }

  // Check for pending unpaid orders
  const pendingOrder = await prisma.order.findFirst({
    where: {
      userId,
      classId: firstClass.id,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
  });

  if (pendingOrder) {
    return {
      order: pendingOrder,
      checkoutUrl: pendingOrder.checkoutUrl,
    };
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      classId: firstClass.id,
      orderNumber,
      amount: project.price,
      currency: project.currency,
      status: 'PENDING',
      provider: 'XENDIT',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      provider: 'XENDIT',
      amount: project.price,
      currency: project.currency,
      status: 'PENDING',
    },
  });

  // Create Xendit invoice
  const invoiceRequest = {
    external_id: orderNumber,
    amount: Number(project.price),
    currency: project.currency,
    description: `Purchase: ${project.title}`,
    success_redirect_url: `${appUrl}/payments/success?order=${orderNumber}`,
    failure_redirect_url: `${appUrl}/payments/failed?order=${orderNumber}`,
    invoice_duration_seconds: 86400, // 24 hours
  };

  const invoice = await xenditService.createInvoice(invoiceRequest);

  // Update order with checkout URL
  await prisma.order.update({
    where: { id: order.id },
    data: {
      checkoutUrl: invoice.invoice_url,
      providerInvoiceId: invoice.id,
    },
  });

  return {
    order: {
      ...order,
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug,
      },
    },
    checkoutUrl: invoice.invoice_url,
  };
});
