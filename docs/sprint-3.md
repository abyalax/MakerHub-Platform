# Sprint 3 — Subscription & Business Analytics

## Epic 1 — Subscription Management

### Feature: Subscription Plan Management

#### Acceptance Criteria

* Admin can create subscription plans.
* Admin can configure:

  * Plan name
  * Plan description
  * Billing interval
  * Price
  * Status (active/inactive)
* Only active plans are visible to learners.
* Learners can view available subscription plans.
* Subscription benefits are displayed before purchase.
* Inactive plans cannot be purchased.
* Plan changes are reflected immediately on the subscription page.

---

### Feature: Subscription Checkout

#### Acceptance Criteria

* Authenticated learners can subscribe to an active plan.
* Unauthenticated users are redirected to login before subscribing.
* Subscription checkout is integrated with Xendit recurring billing.
* Subscription records are created after successful payment authorization.
* Learners receive confirmation after successful subscription activation.
* Failed subscription attempts do not create active subscriptions.
* Subscription transactions are logged for audit purposes.

---

### Feature: Active Subscription Access

#### Acceptance Criteria

* Active subscribers can access premium subscription-based content.
* Access validation occurs on every premium content request.
* Learners without an active subscription cannot access subscriber-only content.
* Subscription status is displayed in learner settings.
* Learners can view:

  * Current plan
  * Subscription start date
  * Next billing date
  * Subscription status

---

### Feature: Subscription Cancellation

#### Acceptance Criteria

* Learners can cancel their subscription.
* Cancellation confirmation is required before processing.
* Subscription remains active until the current billing period ends.
* Future recurring billing is stopped after cancellation.
* Subscription status changes to "cancelled" after processing.
* Learners can view cancellation details and remaining access period.
* Cancellation events are logged.

---

## Epic 2 — Admin Analytics Dashboard

### Feature: User Analytics

#### Acceptance Criteria

* Admin can view user analytics dashboard.
* Dashboard displays:

  * Total users
  * Total learners
  * Total mentors
  * Active users
  * New registrations
* Metrics support configurable date ranges.
* Metrics update automatically when new user activity occurs.
* Analytics are restricted to admin users only.

---

### Feature: Content Analytics

#### Acceptance Criteria

* Admin can view content performance metrics.
* Dashboard displays:

  * Total projects
  * Published projects
  * Draft projects
  * Free projects
  * Premium projects
* Project counts reflect current platform state.
* Analytics support filtering by date range.

---

### Feature: Traffic Analytics

#### Acceptance Criteria

* Platform tracks both authenticated and anonymous visitors.
* Dashboard displays:

  * Daily visitors
  * Weekly visitors
  * Monthly visitors
  * Yearly visitors
  * Total page views
* Visitor metrics are aggregated without requiring authentication.
* Analytics can be viewed by selected date ranges.
* Traffic reports load within acceptable dashboard performance thresholds.

---

### Feature: Financial Analytics

#### Acceptance Criteria

* Admin can view platform revenue metrics.
* Dashboard displays:

  * Gross revenue
  * Net revenue
  * Subscription revenue
  * Class sales revenue
* Revenue values are calculated from completed payments only.
* Financial metrics support date range filtering.
* Revenue calculations remain consistent with payment transaction records.
* Unauthorized users cannot access financial data.

---

## Epic 3 — Mentor Analytics Dashboard

### Feature: Project Performance Analytics

#### Acceptance Criteria

* Mentors can access analytics for their own content only.
* Dashboard displays:

  * Total project views
  * Enrollment count
  * Published projects
* Analytics are updated when learner activity occurs.
* Mentors cannot view analytics belonging to other mentors.

---

### Feature: Top Content Analytics

#### Acceptance Criteria

* Mentors can view their best-performing content.
* Content ranking is based on:

  * Views
  * Enrollments
  * Revenue
* Top content list supports sorting.
* Analytics reflect selected date ranges.

---

### Feature: Revenue Analytics

#### Acceptance Criteria

* Mentors can view earnings generated from their content.
* Dashboard displays:

  * Revenue today
  * Monthly revenue
  * Lifetime revenue
  * Total sales
* Revenue calculations exclude failed or refunded transactions.
* Revenue values match recorded payment data.

---

## Epic 4 — Bookmark & Learning Library

### Feature: Save Project

#### Acceptance Criteria

* Authenticated learners can save projects to their library.
* Saved projects are accessible from the learning library.
* Duplicate bookmarks are prevented.
* Learners can remove saved projects.
* Bookmark state is persisted across sessions.

---

### Feature: Favorite Project

#### Acceptance Criteria

* Learners can mark saved projects as favorites.
* Favorite projects are highlighted in the learning library.
* Learners can remove favorite status.
* Favorite status persists across sessions.

---

### Feature: Continue Learning

#### Acceptance Criteria

* Learning progress is automatically recorded.
* Learners can view recently accessed content.
* Learning library displays:

  * Last accessed lesson
  * Progress percentage
  * Continue learning action
* Learners can resume learning from their last completed position.
* Progress data remains available across devices and sessions.

---

## Epic 5 — Future Module Placeholder

### Feature: Live Learning Navigation

#### Acceptance Criteria

* Navigation menu contains a "Live Learning" entry.
* Menu is visible to all user roles.
* Navigation item follows platform design standards.
* Navigation item is available in production release.

---

### Feature: Coming Soon Page

#### Acceptance Criteria

* Clicking "Live Learning" opens a dedicated page.
* Page clearly indicates the feature is not yet available.
* Page contains:

  * Feature overview
  * Future capability summary
  * Coming Soon message
* No live learning functionality is accessible from this page.

---

### Feature: Domain Preparation

#### Acceptance Criteria

* Database and domain architecture support future entities:

  * Live Session
  * Session Enrollment
  * Session Attendance
  * Session Recording
* Future entities are documented in technical design.
* No production-facing functionality is implemented for these entities.
* Future implementation can be added without major schema redesign.

---

# Sprint 3 Definition of Done

* Subscription purchase flow is fully operational.
* Recurring billing is functional through Xendit.
* Premium content access is enforced by subscription status.
* Admin analytics dashboards are operational.
* Mentor analytics dashboards are operational.
* Bookmark and learning library features are available.
* Traffic analytics include anonymous visitors.
* Live Learning placeholder is visible.
* All critical user journeys pass E2E testing.
* MVP release criteria are satisfied. 
