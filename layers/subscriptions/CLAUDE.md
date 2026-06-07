# Subscriptions Layer - Subscription Management Feature

**Status**: ✅ Feature Layer  
**Priority**: 7 (Loaded after 6-revenue)  
**Dependencies**: shared, 1-auth, 2-users, 3-payments

## Overview

The `subscriptions` layer manages subscription functionality including:
- Subscription plan management (admin)
- Subscription checkout with Xendit recurring billing
- Active subscription access validation
- Subscription cancellation

## Architecture

```
layers/subscriptions/
├── app/
│   ├── components/
│   │   ├── SubscriptionPlanCard.vue    # Plan display card
│   │   ├── SubscriptionCard.vue        # User subscription card
│   │   └── CancelSubscriptionDialog.vue # Cancellation confirmation
│   ├── composables/
│   │   ├── types.ts                     # Subscription types/interfaces
│   │   ├── useSubscriptionsApi.ts       # API service
│   │   └── useSubscriptionsStore.ts     # Pinia store
│   └── pages/
│       ├── admin/
│       │   └── subscriptions/
│       │       ├── plans/
│       │       │   ├── index.vue        # Plan management list
│       │       │   └── [id].vue         # Plan edit/create
│       │       └── index.vue            # All subscriptions list
│       └── subscriptions/
│           ├── index.vue               # Available plans for learners
│           └── my-subscription.vue      # Current subscription status
├── server/
│   └── api/
│       ├── subscription-plans/
│       │   ├── index.get.ts            # GET /api/subscription-plans
│       │   ├── index.post.ts           # POST /api/subscription-plans
│       │   ├── [id].get.ts             # GET /api/subscription-plans/:id
│       │   ├── [id].put.ts             # PUT /api/subscription-plans/:id
│       │   └── [id].delete.ts          # DELETE /api/subscription-plans/:id
│       └── subscriptions/
│           ├── index.get.ts            # GET /api/subscriptions
│           ├── checkout.post.ts        # POST /api/subscriptions/checkout
│           ├── [id].get.ts             # GET /api/subscriptions/:id
│           └── [id].cancel.post.ts     # POST /api/subscriptions/:id/cancel
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Admin - Subscription Plans (`pages/admin/subscriptions/plans/index.vue`)
- List all subscription plans
- Create new plans
- Edit existing plans
- Activate/deactivate plans
- Plan configuration (name, description, price, billing interval, status)

#### Admin - All Subscriptions (`pages/admin/subscriptions/index.vue`)
- View all platform subscriptions
- Filter by status
- View subscription details
- Cancel subscriptions (admin action)

#### Learner - Available Plans (`pages/subscriptions/index.vue`)
- Display active subscription plans only
- Show plan details and benefits
- Subscribe button for authenticated users
- Redirect to login for unauthenticated users

#### Learner - My Subscription (`pages/subscriptions/my-subscription.vue`)
- Display current subscription status
- Show plan details
- Display billing information
- Cancel subscription button
- Show remaining access period if cancelled

### Components

#### SubscriptionPlanCard.vue
Card component for subscription plans:
- Plan name and description
- Price and billing interval
- Benefits list
- Subscribe button
- Active/inactive status badge

#### SubscriptionCard.vue
Card component for user subscriptions:
- Current plan details
- Subscription status
- Billing period dates
- Cancel button

#### CancelSubscriptionDialog.vue
Dialog for subscription cancellation:
- Confirmation message
- Warning about access period
- Confirm cancel button
- Cancel button

### State Management

**useSubscriptionsStore** (Pinia)
```typescript
state: {
  plans: SubscriptionPlan[]
  currentSubscription: Subscription | null
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
}

actions: {
  fetchPlans()
  fetchPlansAdmin()
  createPlan(data)
  updatePlan(id, data)
  deletePlan(id)
  fetchMySubscription()
  fetchAllSubscriptions()
  subscribe(planId)
  cancelSubscription(id)
}
```

### API Service

**useSubscriptionsApi**
- `getPlans(filters?: Filters)` - Fetch active plans for learners
- `getPlansAdmin(filters?: Filters)` - Fetch all plans for admin
- `createPlan(data)` - Create new plan (admin)
- `updatePlan(id, data)` - Update plan (admin)
- `deletePlan(id)` - Delete plan (admin)
- `getMySubscription()` - Get current user subscription
- `getAllSubscriptions(filters)` - Get all subscriptions (admin)
- `subscribe(planId)` - Create subscription checkout
- `cancelSubscription(id)` - Cancel subscription

## Server Routes

### GET /api/subscription-plans
Fetch active subscription plans for learners.

Response:
```typescript
{
  plans: SubscriptionPlan[]
}
```

### POST /api/subscription-plans
Create new subscription plan (admin only).

Body:
```typescript
{
  name: string
  description: string
  price: number
  currency: string
  billingInterval: 'MONTHLY' | 'YEARLY'
  isActive: boolean
}
```

### PUT /api/subscription-plans/:id
Update subscription plan (admin only).

### DELETE /api/subscription-plans/:id
Delete subscription plan (admin only).

### GET /api/subscriptions
Fetch current user's subscription.

Response:
```typescript
{
  subscription: Subscription | null
}
```

### POST /api/subscriptions/checkout
Create subscription checkout with Xendit.

Body:
```typescript
{
  planId: number
}
```

Response:
```typescript
{
  order: Order
  checkoutUrl: string
}
```

### POST /api/subscriptions/:id/cancel
Cancel subscription.

Response:
```typescript
{
  subscription: Subscription
}
```

## Types

```typescript
interface SubscriptionPlan {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  billingInterval: 'MONTHLY' | 'YEARLY'
  xenditPlanId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Subscription {
  id: number
  userId: number
  subscriptionPlanId: number
  provider: 'XENDIT'
  providerExternalId: string | null
  status: 'INCOMPLETE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
  plan?: SubscriptionPlan
}

interface CreatePlanData {
  name: string
  description: string
  price: number
  currency: string
  billingInterval: 'MONTHLY' | 'YEARLY'
  isActive: boolean
}
```

## Xendit Integration

### Recurring Billing
- Create Xendit plan for each subscription plan
- Use Xendit recurring billing API
- Handle webhook events for subscription lifecycle
- Sync subscription status with Xendit

### Webhook Events
Handled events:
- `subscription.paid` - Payment successful
- `subscription.expired` - Subscription expired
- `subscription.canceled` - Subscription canceled

## Security

- ✅ Admin-only access for plan management
- ✅ User-specific subscription data
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ Authentication required for subscription actions

## Performance

- Efficient queries with Prisma
- Database indexing on status and userId
- Caching with Pinia
- Pagination for admin subscription lists

## Testing

- Unit tests: `tests/unit/subscriptions/`
- E2E tests: `tests/e2e/subscriptions/`
- Webhook tests: `tests/unit/subscriptions/webhooks/`

## Notes

- Only active plans are visible to learners
- Inactive plans cannot be purchased
- Cancellation keeps subscription active until period end
- Future billing stopped after cancellation
- Subscription status changes to "canceled" after processing
- All subscription events logged for audit

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
