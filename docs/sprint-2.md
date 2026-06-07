# Sprint 2 — Monetization & Learning Experience

## Goal

Enable mentors to monetize projects and allow learners to purchase, access, and complete premium learning content with a complete end-to-end purchase, access, and progress flow.

---

## Sprint 2 End-to-End Slice

### Core delivery flow

* Learners discover premium projects alongside free content.
* Learners review premium project details and preview locked content.
* Learners initiate checkout from the project page and are redirected to Xendit.
* Payment success creates an enrollment and entitlement record.
* Enrolled learners access premium lessons, track progress, and resume where they left off.
* Mentors receive revenue and engagement analytics for their premium projects.

### Alignment goals

* Purchase, enrollment, access, and progress all work together as one integrated experience.
* Premium content is protected on both the client and server.
* Payments are durable, audited, and idempotent.
* Enrollment and progress state persist across sessions and devices.
* Mentor-facing revenue insights reflect actual successful purchases only.

---

## Sprint 2 Outcomes

At the end of this sprint:

* Mentors can mark projects as Free or Premium and manage pricing.
* Learners can browse premium projects, initiate payment, and gain access after successful purchase.
* Platform enforces premium access checks on every protected request.
* Learners can see enrollment, progress, and learning history in one place.
* Mentors can view project-level revenue and sales metrics.

---

# Epic 1 — Premium Project Management

## Feature: Create Premium Project

### Acceptance Criteria

* Mentor can configure a project as either Free or Premium.
* Mentor can assign a price to a Premium project.
* Price must be greater than zero for Premium projects.
* Free projects must not require a price.
* Project pricing is displayed on the project detail page.
* Changes to pricing are saved and reflected immediately on published projects.
* Only the project owner or admin can modify pricing.

---

## Feature: Premium Project Preview

### Acceptance Criteria

* Guests and learners can view premium project metadata.
* Guests and learners can view project title, description, objectives, mentor information, and preview content.
* Locked lessons and premium resources are clearly identified.
* Users without access cannot open premium lessons.
* Users without access are presented with a purchase call-to-action.
* Access restrictions are enforced on both UI and server-side authorization.

---

## Feature: Premium Access Control

### Acceptance Criteria

* Purchased learners can access all premium project content.
* Active subscribers can access premium content covered by their subscription.
* Users without entitlement are denied access.
* Revoked or expired entitlements immediately remove premium access.
* Access checks are enforced on every protected content request.

---

# Epic 2 — Xendit One-Time Payment

## Feature: Checkout Creation

### Acceptance Criteria

* Learner can initiate purchase from a premium project page.
* System creates a payment request through Xendit.
* Learner is redirected to the payment experience.
* Unique payment reference is generated for every purchase.
* Duplicate unpaid purchase requests are prevented.

---

## Feature: Payment Verification

### Acceptance Criteria

* System receives payment status updates from Xendit.
* Successful payment automatically grants project access.
* Failed payments do not grant access.
* Pending payments remain in pending state.
* Payment records are persisted for audit purposes.
* Duplicate webhook events do not create duplicate purchases.

---

## Feature: Payment History

### Acceptance Criteria

* Learner can view payment history.
* Payment history displays purchased project, amount, status, and purchase date.
* History is ordered by newest transaction first.
* Learner can only view their own payment records.

---

# Epic 3 — Enrollment & Learning Library

## Feature: Project Enrollment

### Acceptance Criteria

* Successful purchase automatically creates an enrollment record.
* Enrollment status is available for purchased projects.
* Duplicate enrollments for the same learner and project are prevented.
* Enrollment remains active after successful payment validation.

---

## Feature: My Learning

### Acceptance Criteria

* Learner can access a dedicated learning library.
* Library displays all enrolled projects.
* Library displays enrollment status.
* Library displays learning progress percentage.
* Library supports navigation directly to learning content.
* Projects are sorted by recent activity.

---

## Feature: Continue Learning

### Acceptance Criteria

* System remembers the learner's last visited lesson.
* Learner can resume learning from their latest unfinished lesson.
* Continue Learning action navigates directly to the saved lesson.
* Progress state persists across sessions and devices.

---

# Epic 4 — Learning Progress Tracking

## Feature: Lesson Completion

### Acceptance Criteria

* Learner can mark a lesson as completed.
* Completed lessons remain completed across sessions.
* Learner can unmark a completed lesson.
* Completion state updates immediately after action.

---

## Feature: Project Progress Calculation

### Acceptance Criteria

* System calculates progress percentage based on completed lessons.
* Progress percentage updates automatically after lesson completion changes.
* Progress percentage is visible in learning library and project view.
* Progress cannot exceed 100%.

---

## Feature: Learning History

### Acceptance Criteria

* System records learning activity timestamps.
* Learner can view recently accessed projects.
* Last learning activity is updated whenever content is accessed.
* Learning history is restricted to the authenticated learner.

---

# Epic 5 — Mentor Revenue Dashboard

## Feature: Revenue Overview

### Acceptance Criteria

* Mentor can view total sales.
* Mentor can view total revenue.
* Mentor can view today's revenue.
* Mentor can view monthly revenue.
* Mentor can view lifetime revenue.
* Revenue figures only include successful transactions.

---

## Feature: Sales Analytics

### Acceptance Criteria

* Mentor can view enrollment count per project.
* Mentor can view revenue generated per project.
* Mentor can identify top-performing projects.
* Analytics data is filtered to mentor-owned content only.

---

## Feature: Revenue Transaction List

### Acceptance Criteria

* Mentor can view a list of sales transactions.
* Transaction list includes project name, learner, amount, status, and purchase date.
* Failed transactions are clearly distinguished from successful transactions.
* Results support pagination.

---

# Sprint 2 Definition of Done

### Learner

* Can purchase premium projects.
* Can access purchased content.
* Can view payment history.
* Can track learning progress.
* Can continue unfinished learning activities.
* Can manage enrolled learning content.

### Mentor

* Can monetize projects.
* Can define project pricing.
* Can view revenue performance.
* Can view enrollment metrics.

### Platform

* Xendit payment integration is operational.
* Premium access control is enforced.
* Enrollment lifecycle is automated.
* Revenue tracking is available.
* End-to-end premium purchase and learning flow is validated.
* Platform is capable of generating revenue.  
