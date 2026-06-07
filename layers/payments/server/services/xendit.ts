import { createError } from 'h3';
import { createHmac } from 'node:crypto';
import { prisma } from '~/layers/shared/server/db/prisma';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface XenditInvoiceRequest {
  external_id: string;
  amount: number;
  currency: string;
  description: string;
  success_redirect_url: string;
  failure_redirect_url: string;
  invoice_duration_seconds?: number;
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  amount: number;
  currency: string;
  description: string;
  invoice_url: string;
  status: string;
  expiry_date: string;
}

export interface XenditRecurringPlanRequest {
  external_id: string;
  amount: number;
  currency: string;
  interval: 'MONTH' | 'WEEK' | 'YEAR';
  interval_count: number;
  description: string;
}

export interface XenditRecurringPlanResponse {
  id: string;
  external_id: string;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  description: string;
  status: string;
}

export class XenditService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    const config = useRuntimeConfig();

    this.apiKey = config.xenditApiKey;
    this.apiUrl = config.xenditApiUrl;

    if (!this.apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server Error',
        message: 'Missing Xendit API key',
      });
    }
  }

  private getAuthHeader() {
    const authString = `${this.apiKey}:`;
    return {
      Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
    };
  }

  async createInvoice(request: XenditInvoiceRequest): Promise<XenditInvoiceResponse> {
    try {
      const response = await $fetch<XenditInvoiceResponse>(`${this.apiUrl}/v2/invoices`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: request,
      });
      return response;
    } catch (error) {
      console.error('Xendit invoice creation error:', error);
      throw new Error('Failed to create Xendit invoice');
    }
  }

  async createRecurringPlan(request: XenditRecurringPlanRequest): Promise<XenditRecurringPlanResponse> {
    try {
      const response = await $fetch<XenditRecurringPlanResponse>(`${this.apiUrl}/v2/recurring/payment/plans`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: request,
      });
      return response;
    } catch (error) {
      console.error('Xendit recurring plan creation error:', error);
      throw new Error('Failed to create Xendit recurring plan');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await $fetch(`${this.apiUrl}/v2/recurring/payments/${subscriptionId}/stop`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Xendit subscription cancellation error:', error);
      throw new Error('Failed to cancel Xendit subscription');
    }
  }

  async verifyWebhookSignature(payload: string, signature: string, webhookToken: string): Promise<boolean> {
    const expectedSignature = createHmac('sha512', webhookToken).update(payload).digest('hex');

    return signature === expectedSignature;
  }

  async handleInvoicePaid(webhookData: Record<string, unknown>) {
    const { external_id, paid_at } = webhookData;
    const paidAtString = paid_at as string;
    const externalId = external_id as string;

    // Find the order by external_id (orderNumber)
    const order = await prisma.order.findUnique({
      where: { orderNumber: externalId },
      include: { payments: true },
    });

    if (!order) {
      console.error('Order not found for webhook:', externalId);
      return;
    }

    // Update payment status
    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          providerPaymentId: webhookData.payment_id?.toString(),
          paidAt: new Date(paidAtString),
        },
      });
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        providerInvoiceId: webhookData.id?.toString(),
      },
    });

    // Create entitlement for class
    if (order.classId) {
      await prisma.entitlement.create({
        data: {
          userId: order.userId,
          classId: order.classId,
          orderId: order.id,
          type: 'PURCHASE',
          startsAt: new Date(),
        },
      });

      // Create enrollment if it doesn't exist
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: order.userId,
          classId: order.classId,
        },
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: order.userId,
            classId: order.classId,
            status: 'ACTIVE',
          },
        });
      }
    } else if (order.subscriptionPlanId) {
      // Create subscription instead of entitlement
      await prisma.subscription.create({
        data: {
          userId: order.userId,
          subscriptionPlanId: order.subscriptionPlanId,
          status: 'ACTIVE',
        },
      });
    }

    // Record webhook event
    await prisma.providerWebhookEvent.create({
      data: {
        provider: 'XENDIT',
        eventId: webhookData.id?.toString() || '',
        eventType: 'invoice.paid',
        payload: webhookData as any,
        processedAt: new Date(),
      },
    });
  }

  async handleInvoiceExpired(webhookData: Record<string, unknown>) {
    const { external_id } = webhookData;
    const externalId = external_id as string;

    const order = await prisma.order.findUnique({
      where: { orderNumber: externalId },
    });

    if (!order) {
      console.error('Order not found for webhook:', externalId);
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'EXPIRED' },
    });

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' },
      });
    }

    await prisma.providerWebhookEvent.create({
      data: {
        provider: 'XENDIT',
        eventId: webhookData.id?.toString() || '',
        eventType: 'invoice.expired',
        payload: webhookData as any,
        processedAt: new Date(),
      },
    });
  }

  async handleInvoiceFailed(webhookData: Record<string, unknown>) {
    const { external_id } = webhookData;
    const externalId = external_id as string;

    const order = await prisma.order.findUnique({
      where: { orderNumber: externalId },
    });

    if (!order) {
      console.error('Order not found for webhook:', externalId);
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED' },
    });

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    await prisma.providerWebhookEvent.create({
      data: {
        provider: 'XENDIT',
        eventId: webhookData.id?.toString() || '',
        eventType: 'invoice.failed',
        payload: webhookData as any,
        processedAt: new Date(),
      },
    });
  }
}

export const xenditService = new XenditService();
