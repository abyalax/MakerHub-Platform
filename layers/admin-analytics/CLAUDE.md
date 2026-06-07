# Admin Analytics Layer - Admin Analytics Dashboard Feature

**Status**: ✅ Feature Layer  
**Priority**: 8 (Loaded after 7-subscriptions)  
**Dependencies**: shared, 1-auth, 2-users

## Overview

The `admin-analytics` layer manages admin analytics functionality including:
- User analytics (total users, learners, mentors, active users, new registrations)
- Content analytics (projects, classes, published/draft counts, free/premium counts)
- Traffic analytics (visitors, page views, date range filtering)
- Financial analytics (gross revenue, net revenue, subscription revenue, class sales)

## Architecture

```
layers/admin-analytics/
├── app/
│   ├── composables/
│   │   ├── types.ts                # Analytics types/interfaces
│   │   ├── useAnalyticsApi.ts      # API service
│   │   └── useAnalyticsStore.ts    # Pinia store
│   └── pages/
│       └── admin/
│           └── analytics/
│               ├── index.vue       # Main analytics dashboard
│               ├── users.vue       # User analytics
│               ├── content.vue     # Content analytics
│               ├── traffic.vue     # Traffic analytics
│               └── financial.vue   # Financial analytics
├── server/
│   └── api/
│       └── analytics/
│           ├── users.get.ts       # GET /api/analytics/users
│           ├── content.get.ts     # GET /api/analytics/content
│           ├── traffic.get.ts     # GET /api/analytics/traffic
│           └── financial.get.ts    # GET /api/analytics/financial
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Main Analytics Dashboard (`pages/admin/analytics/index.vue`)
- Overview of all analytics
- Quick stats cards
- Navigation to detailed views

#### User Analytics (`pages/admin/analytics/users.vue`)
- Total users
- Total learners
- Total mentors
- Active users
- New registrations
- Date range filtering

#### Content Analytics (`pages/admin/analytics/content.vue`)
- Total projects
- Published projects
- Draft projects
- Free projects
- Premium projects
- Date range filtering

#### Traffic Analytics (`pages/admin/analytics/traffic.vue`)
- Daily visitors
- Weekly visitors
- Monthly visitors
- Yearly visitors
- Total page views
- Date range filtering
- Anonymous visitor tracking

#### Financial Analytics (`pages/admin/analytics/financial.vue`)
- Gross revenue
- Net revenue
- Subscription revenue
- Class sales revenue
- Date range filtering

### State Management

**useAnalyticsStore** (Pinia)
```typescript
state: {
  userMetrics: UserMetrics | null
  contentMetrics: ContentMetrics | null
  trafficMetrics: TrafficMetrics | null
  financialMetrics: FinancialMetrics | null
  loading: boolean
  error: string | null
}

actions: {
  fetchUserMetrics(filters)
  fetchContentMetrics(filters)
  fetchTrafficMetrics(filters)
  fetchFinancialMetrics(filters)
}
```

### API Service

**useAnalyticsApi**
- `getUserMetrics(filters)` - Fetch user analytics
- `getContentMetrics(filters)` - Fetch content analytics
- `getTrafficMetrics(filters)` - Fetch traffic analytics
- `getFinancialMetrics(filters)` - Fetch financial analytics

## Server Routes

### GET /api/analytics/users
Fetch user analytics for admin.

Query params:
- `startDate` - Start date for filtering
- `endDate` - End date for filtering

Response:
```typescript
{
  totalUsers: number
  totalLearners: number
  totalMentors: number
  activeUsers: number
  newRegistrations: number
}
```

### GET /api/analytics/content
Fetch content analytics for admin.

Query params:
- `startDate` - Start date for filtering
- `endDate` - End date for filtering

Response:
```typescript
{
  totalProjects: number
  publishedProjects: number
  draftProjects: number
  freeProjects: number
  premiumProjects: number
}
```

### GET /api/analytics/traffic
Fetch traffic analytics for admin.

Query params:
- `startDate` - Start date for filtering
- `endDate` - End date for filtering

Response:
```typescript
{
  dailyVisitors: number
  weeklyVisitors: number
  monthlyVisitors: number
  yearlyVisitors: number
  totalPageViews: number
}
```

### GET /api/analytics/financial
Fetch financial analytics for admin.

Query params:
- `startDate` - Start date for filtering
- `endDate` - End date for filtering

Response:
```typescript
{
  grossRevenue: number
  netRevenue: number
  subscriptionRevenue: number
  classSalesRevenue: number
}
```

## Types

```typescript
interface UserMetrics {
  totalUsers: number;
  totalLearners: number;
  totalMentors: number;
  activeUsers: number;
  newRegistrations: number;
}

interface ContentMetrics {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  freeProjects: number;
  premiumProjects: number;
}

interface TrafficMetrics {
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  yearlyVisitors: number;
  totalPageViews: number;
}

interface FinancialMetrics {
  grossRevenue: number;
  netRevenue: number;
  subscriptionRevenue: number;
  classSalesRevenue: number;
}

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
}
```

## Security

- ✅ Admin-only access
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ Date range validation

## Performance

- Efficient aggregation queries with Prisma
- Database indexing on date fields
- Caching with Pinia
- Optimized queries for large datasets

## Testing

- Unit tests: `tests/unit/admin-analytics/`
- E2E tests: `tests/e2e/admin-analytics/`

## Notes

- Analytics restricted to admin users only
- Metrics update automatically when new activity occurs
- Traffic analytics include anonymous visitors
- Financial metrics calculated from completed payments only
- All metrics support configurable date ranges

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
