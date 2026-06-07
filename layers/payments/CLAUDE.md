# Payments Layer - Payment Processing Feature

**Status**: ✅ Feature Layer  
**Priority**: 3 (Loaded after 2-users)  
**Dependencies**: shared, 1-auth, 2-users

## Overview

The `payments` layer manages payment processing functionality including:
- Xendit checkout creation
- Payment verification via webhooks
- Payment history for learners
- Order management

## Architecture

```
layers/payments/
├── app/
│   ├── components/
│   │   ├── PaymentCard.vue         # Payment card display
│   │   ├── PaymentHistory.vue      # Payment history list
│   │   └── CheckoutButton.vue      # Checkout button
│   ├── composables/
│   │   ├── types.ts                # Payment types/interfaces
│   │   ├── usePaymentsApi.ts       # API service
│   │   ├── usePaymentsStore.ts     # Pinia store
│   │   └── useCheckout.ts          # Checkout logic
│   └── pages/
│       └── payments/
│           ├── index.vue           # Payment history page
│           └── [id].vue            # Payment detail page
├── server/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── index.get.ts        # GET /api/payments (history)
│   │   │   ├── checkout.post.ts    # POST /api/payments/checkout
│   │   │   └── [id].get.ts         # GET /api/payments/:id
│   │   └── webhooks/
│   │       └── xendit/
│   │           └── index.post.ts   # POST /api/webhooks/xendit
│   └── services/
│       └── xendit.ts              # Xendit API service
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Payment History (`pages/payments/index.vue`)
- Display all user payments
- Filter by status
- Pagination
- View payment details

#### Payment Detail (`pages/payments/[id].vue`)
- Display single payment details
- Show order information
- Payment status

### Components

#### PaymentCard.vue
Card component for displaying payment information:
- Project name
- Amount
- Status
- Date
- Action buttons

#### PaymentHistory.vue
List component for payment history:
- Table view
- Status badges
- Sorting options

#### CheckoutButton.vue
Button component for initiating checkout:
- Price display
- Loading state
- Error handling

### State Management

**usePaymentsStore** (Pinia)
```typescript
state: {
  payments: Payment[]
  currentPayment: Payment | null
  loading: boolean
  error: string | null
}

actions: {
  fetchHistory()
  fetchById(id)
  createCheckout(projectId)
  verifyPayment(webhookData)
}
```

### API Service

**usePaymentsApi**
- `getHistory(filters?: Filters)` - Fetch payment history
- `getById(id: string)` - Fetch single payment
- `createCheckout(projectId: string)` - Create Xendit checkout
- `verifyWebhook(data: WebhookData)` - Verify payment webhook

## Server Routes

### GET /api/payments
Fetch payment history for authenticated user.

Query params:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status

Response:
```typescript
{
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/payments/checkout
Create Xendit checkout for a premium project.

Body:
```typescript
{
  projectId: string
}
```

Response:
```typescript
{
  order: Order
  checkoutUrl: string
}
```

### GET /api/payments/:id
Fetch single payment by ID.

### POST /api/webhooks/xendit
Handle Xendit payment webhook.

Body:
```typescript
{
  event_id: string
  event_type: string
  data: WebhookData
}
```

## Types

```typescript
interface Payment {
  id: string
  orderId: string
  userId: string
  provider: 'XENDIT'
  providerPaymentId: string | null
  amount: number
  currency: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'REFUNDED'
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  userId: string
  projectId: string | null
  classId: string | null
  orderNumber: string
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELED' | 'REFUNDED'
  provider: 'XENDIT'
  checkoutUrl: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

interface CreateCheckoutData {
  projectId: string
}
```

## Xendit Integration

### Xendit Service
The Xendit service handles:
- Creating invoice/checkout
- Verifying webhook signatures
- Processing payment callbacks

### Webhook Events
Handled events:
- `invoice.paid` - Payment successful
- `invoice.expired` - Payment expired
- `invoice.failed` - Payment failed

## Security

- ✅ Webhook signature verification
- ✅ Idempotency handling (duplicate events)
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ User-specific data access

## Performance

- Pagination for payment history
- Webhook event deduplication
- Async payment processing
- Database indexing on status and userId

## Testing

- Unit tests: `tests/unit/payments/`
- E2E tests: `tests/e2e/payments/`
- Webhook tests: `tests/unit/payments/webhooks/`

## Notes

- Xendit API credentials in environment variables
- Webhook endpoint must be publicly accessible
- Payment verification must be idempotent
- Entitlements granted only on successful payment

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
