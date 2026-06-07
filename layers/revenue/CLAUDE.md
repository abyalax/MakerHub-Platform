# Revenue Layer - Mentor Revenue Dashboard Feature

**Status**: ✅ Feature Layer  
**Priority**: 6 (Loaded after 5-progress)  
**Dependencies**: shared, 1-auth, 2-users, 3-payments

## Overview

The `revenue` layer manages mentor revenue functionality including:
- Revenue overview (total sales, revenue metrics)
- Sales analytics (enrollment count, revenue per project)
- Revenue transaction list

## Architecture

```
layers/revenue/
├── app/
│   ├── components/
│   │   ├── RevenueCard.vue         # Revenue metric card
│   │   ├── SalesChart.vue          # Sales analytics chart
│   │   └── TransactionTable.vue    # Transaction list table
│   ├── composables/
│   │   ├── types.ts                # Revenue types/interfaces
│   │   ├── useRevenueApi.ts        # API service
│   │   └── useRevenueStore.ts      # Pinia store
│   └── pages/
│       └── dashboard/
│           └── revenue/
│               └── index.vue       # Revenue dashboard page
├── server/
│   └── api/
│       └── revenue/
│           ├── overview.get.ts      # GET /api/revenue/overview
│           ├── analytics.get.ts    # GET /api/revenue/analytics
│           └── transactions.get.ts # GET /api/revenue/transactions
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Revenue Dashboard (`pages/dashboard/revenue/index.vue`)
- Revenue overview cards (total sales, today's revenue, monthly revenue, lifetime revenue)
- Sales analytics chart
- Transaction list with pagination

### Components

#### RevenueCard.vue
Card component for revenue metrics:
- Metric label
- Value display
- Percentage change
- Icon indicator

#### SalesChart.vue
Chart component for sales analytics:
- Revenue over time
- Enrollment trends
- Project performance comparison

#### TransactionTable.vue
Table component for transactions:
- Project name
- Learner name
- Amount
- Status
- Purchase date
- Pagination

### State Management

**useRevenueStore** (Pinia)
```typescript
state: {
  overview: RevenueOverview | null
  analytics: SalesAnalytics[]
  transactions: Transaction[]
  loading: boolean
  error: string | null
}

actions: {
  fetchOverview()
  fetchAnalytics()
  fetchTransactions(filters)
}
```

### API Service

**useRevenueApi**
- `getOverview()` - Fetch revenue overview
- `getAnalytics()` - Fetch sales analytics
- `getTransactions(filters)` - Fetch transaction list

## Server Routes

### GET /api/revenue/overview
Fetch revenue overview for authenticated mentor.

Response:
```typescript
{
  totalSales: number
  totalRevenue: number
  todayRevenue: number
  monthlyRevenue: number
  lifetimeRevenue: number
}
```

### GET /api/revenue/analytics
Fetch sales analytics for mentor's projects.

Response:
```typescript
{
  projectId: number
  projectTitle: string
  enrollmentCount: number
  revenue: number
}[]
```

### GET /api/revenue/transactions
Fetch transaction list for mentor.

Query params:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status

Response:
```typescript
{
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

## Types

```typescript
interface RevenueOverview {
  totalSales: number
  totalRevenue: number
  todayRevenue: number
  monthlyRevenue: number
  lifetimeRevenue: number
}

interface SalesAnalytics {
  projectId: number
  projectTitle: string
  enrollmentCount: number
  revenue: number
}

interface Transaction {
  id: number
  projectId: number
  projectTitle: string
  learnerName: string
  amount: number
  currency: string
  status: 'PAID' | 'FAILED' | 'PENDING'
  purchaseDate: string
}
```

## Security

- ✅ Mentor-only access
- ✅ User-specific data access (mentor's projects only)
- ✅ Server-side validation
- ✅ Protected API routes

## Performance

- Efficient queries with Prisma
- Database indexing on mentorId and status
- Pagination for transaction lists
- Aggregation queries for analytics

## Testing

- Unit tests: `tests/unit/revenue/`
- E2E tests: `tests/e2e/revenue/`

## Notes

- Revenue figures only include successful transactions
- Analytics filtered to mentor-owned content only
- Transaction results support pagination
- Failed transactions clearly distinguished from successful

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
