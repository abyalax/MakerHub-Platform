# Marketplace Project-Based Learning — Test Case Coverage Document

## Authentication & Role Management - verify user identity, session handling, and role-based access

- [ ] test - User can register as a learner with valid credentials.
- [ ] test - User cannot register with duplicate email.
- [ ] test - User cannot register with invalid email or weak password.
- [ ] test - User can login with valid credentials.
- [ ] test - User cannot login with invalid credentials.
- [ ] test - User can logout successfully.
- [ ] test - Guest cannot access authenticated-only pages.
- [ ] test - Learner cannot access mentor-only dashboard.
- [ ] test - Mentor cannot access admin dashboard.
- [ ] test - Admin can access admin dashboard.
- [ ] test - Public profile is visible for registered users.
- [ ] test - User session persists after page refresh.
- [ ] test - Expired session redirects user to login.

## Project Discovery - verify public browsing, searching, filtering, and project visibility

- [ ] test - Guest can access home page.
- [ ] test - Guest can view project listing.
- [ ] test - Guest can view project detail.
- [ ] test - Guest can search projects by keyword.
- [ ] test - Guest can filter projects by category.
- [ ] test - Guest can view mentor profile page.
- [ ] test - Free projects are accessible without login.
- [ ] test - Premium projects appear in listing for guests.
- [ ] test - Premium project preview is visible without payment.
- [ ] test - Full premium content is locked for guest users.
- [ ] test - Empty search result shows proper empty state.
- [ ] test - Invalid project URL shows not found page.

## Project Authoring - verify mentor project creation and publishing workflow

- [ ] test - Mentor can create a new project.
- [ ] test - Mentor can edit an existing own project.
- [ ] test - Mentor cannot edit another mentor project.
- [ ] test - Mentor can save project as draft.
- [ ] test - Draft project is not visible publicly.
- [ ] test - Mentor can publish a valid project.
- [ ] test - Published project becomes visible in project listing.
- [ ] test - Mentor cannot publish project with missing required content.
- [ ] test - Mentor can unpublish own project if allowed by business rule.
- [ ] test - Project contains title, description, objectives, resources, assignments, and completion criteria.
- [ ] test - Project detail renders learning content correctly.
- [ ] test - Project update keeps previous content version consistent.

## Media Management - verify upload and usage of learning assets

- [ ] test - Mentor can upload cover image.
- [ ] test - Mentor can upload learning image.
- [ ] test - Mentor can upload PDF material.
- [ ] test - Mentor can upload video material.
- [ ] test - Uploaded media appears in project content.
- [ ] test - Unsupported file type is rejected.
- [ ] test - Oversized file upload is rejected.
- [ ] test - Failed upload shows proper error message.
- [ ] test - Mentor can remove uploaded asset from project.
- [ ] test - Removed asset no longer appears in project detail.
- [ ] test - Guest can view public media for free project.
- [ ] test - Premium media remains locked before purchase or subscription.

## Admin Moderation - verify admin control over users, mentors, and projects

- [ ] test - Admin can view user list.
- [ ] test - Admin can view mentor list.
- [ ] test - Admin can view project list.
- [ ] test - Admin can publish a project.
- [ ] test - Admin can unpublish a project.
- [ ] test - Unpublished project is removed from public listing.
- [ ] test - Admin can inspect project status.
- [ ] test - Non-admin user cannot access moderation features.
- [ ] test - Admin dashboard handles empty data state.
- [ ] test - Moderation action is reflected immediately in project visibility.

## Premium Project & Pricing - verify monetized project behavior

- [ ] test - Mentor can mark project as free.
- [ ] test - Mentor can mark project as premium.
- [ ] test - Mentor can set project price for premium project.
- [ ] test - Premium project requires valid price.
- [ ] test - Free project does not require price.
- [ ] test - Premium project preview is visible before purchase.
- [ ] test - Full premium content is hidden before purchase.
- [ ] test - Purchased learner can access full premium content.
- [ ] test - Unpurchased learner cannot access full premium content.
- [ ] test - Premium project remains discoverable publicly.
- [ ] test - Price is displayed correctly on listing and detail page.
- [ ] test - Price update affects new purchases only if required by business rule.

## Xendit One-Time Payment - verify class purchase and payment processing

- [ ] test - Learner can start checkout for premium class.
- [ ] test - Guest is redirected to login before purchase.
- [ ] test - Payment request is created with correct amount.
- [ ] test - Successful payment grants access to premium class.
- [ ] test - Failed payment does not grant access.
- [ ] test - Pending payment does not grant access until confirmed.
- [ ] test - Duplicate payment webhook does not create duplicate purchase.
- [ ] test - Invalid webhook signature is rejected.
- [ ] test - Payment history shows completed purchase.
- [ ] test - Payment history does not expose other users' transactions.
- [ ] test - Purchase verification returns correct access status.
- [ ] test - Learner can resume access after payment confirmation.

## Enrollment & My Learning - verify learner class ownership and library access

- [ ] test - Learner is enrolled after successful class purchase.
- [ ] test - Learner can access purchased class from My Learning.
- [ ] test - Learner cannot access unpaid class from My Learning.
- [ ] test - My Learning lists active enrolled classes.
- [ ] test - My Learning handles empty state.
- [ ] test - Enrollment is not duplicated after repeated access.
- [ ] test - Enrollment remains valid after logout and login.
- [ ] test - Enrollment access is blocked if payment is refunded or revoked, if supported.

## Progress Tracking - verify lesson completion and learning continuity

- [ ] test - Learner can mark lesson as complete.
- [ ] test - Learner can unmark lesson completion if supported.
- [ ] test - Progress percentage updates after lesson completion.
- [ ] test - Completed project appears in learning history.
- [ ] test - Continue learning opens latest unfinished lesson.
- [ ] test - Progress persists after refresh.
- [ ] test - Progress persists after logout and login.
- [ ] test - Guest cannot track learning progress.
- [ ] test - Progress is scoped to the correct learner.
- [ ] test - Progress cannot be modified for another learner.

## Mentor Revenue Dashboard - verify mentor monetization metrics

- [ ] test - Mentor can view total sales.
- [ ] test - Mentor can view revenue today.
- [ ] test - Mentor can view monthly revenue.
- [ ] test - Mentor can view lifetime revenue.
- [ ] test - Revenue only includes mentor-owned content.
- [ ] test - Failed payments are excluded from revenue.
- [ ] test - Pending payments are not counted as confirmed revenue.
- [ ] test - Refunded payments are deducted if refund handling exists.
- [ ] test - Revenue dashboard handles zero-sales state.
- [ ] test - Mentor cannot view another mentor revenue data.

## Subscription - verify recurring plan access and lifecycle

- [ ] test - Learner can view subscription plans.
- [ ] test - Learner can start subscription checkout.
- [ ] test - Active subscription grants premium content access.
- [ ] test - Inactive subscription does not grant premium access.
- [ ] test - Cancelled subscription updates access according to billing rule.
- [ ] test - Expired subscription removes premium access.
- [ ] test - Xendit recurring billing webhook activates subscription.
- [ ] test - Failed recurring billing updates subscription status.
- [ ] test - Duplicate subscription webhook is idempotent.
- [ ] test - Subscription revenue appears in financial analytics.
- [ ] test - Learner can view subscription status.
- [ ] test - Learner can cancel active subscription.

## Bookmark & Learning Library - verify saved content and learning continuation

- [ ] test - Learner can save project.
- [ ] test - Learner can remove saved project.
- [ ] test - Learner can favorite project.
- [ ] test - Favorite project appears in learning library.
- [ ] test - Saved project appears in learning library.
- [ ] test - Duplicate save does not create duplicate record.
- [ ] test - Guest cannot save project.
- [ ] test - Continue learning opens last accessed content.
- [ ] test - Removed bookmark disappears from library.
- [ ] test - Library shows empty state when no saved content exists.

## Admin Analytics - verify platform-level business reporting

- [ ] test - Admin can view total users.
- [ ] test - Admin can view active users.
- [ ] test - Admin can view new users.
- [ ] test - Admin can view total projects.
- [ ] test - Admin can view free project count.
- [ ] test - Admin can view premium project count.
- [ ] test - Admin can view daily visitors.
- [ ] test - Admin can view weekly visitors.
- [ ] test - Admin can view monthly visitors.
- [ ] test - Admin can view yearly visitors.
- [ ] test - Anonymous visitors are included in traffic analytics.
- [ ] test - Admin can view gross revenue.
- [ ] test - Admin can view net revenue.
- [ ] test - Admin can view subscription revenue.
- [ ] test - Analytics data updates after new user registration.
- [ ] test - Analytics data updates after project publication.
- [ ] test - Analytics data updates after successful payment.
- [ ] test - Non-admin users cannot access analytics dashboard.

## Mentor Analytics - verify content performance reporting

- [ ] test - Mentor can view project views.
- [ ] test - Mentor can view enrollment count.
- [ ] test - Mentor can view top content.
- [ ] test - Mentor can view revenue analytics.
- [ ] test - Mentor analytics only includes mentor-owned projects.
- [ ] test - Project view count increases after project detail visit.
- [ ] test - Enrollment count increases after successful purchase.
- [ ] test - Top content ranking updates based on engagement.
- [ ] test - Mentor analytics handles no-data state.
- [ ] test - Learner cannot access mentor analytics.

## Live Learning Placeholder - verify future module visibility without MVP implementation

- [ ] test - Live Learning menu item is visible.
- [ ] test - Live Learning page opens successfully.
- [ ] test - Live Learning page displays Coming Soon state.
- [ ] test - Live Learning does not allow session creation in MVP.
- [ ] test - Live Learning does not allow booking or payment in MVP.
- [ ] test - Live Learning placeholder does not break navigation.
- [ ] test - Future domain preparation does not expose unfinished user flows.
- [ ] test - Unauthorized users do not access any hidden live learning management page.

## Access Control Matrix - verify permissions across guest, learner, mentor, and admin

- [ ] test - Guest can browse projects.
- [ ] test - Guest can search projects.
- [ ] test - Guest can view mentor profiles.
- [ ] test - Guest can access free projects.
- [ ] test - Guest cannot purchase without authentication.
- [ ] test - Guest cannot access premium full content.
- [ ] test - Learner can purchase premium class.
- [ ] test - Learner can subscribe.
- [ ] test - Learner can track progress.
- [ ] test - Learner can bookmark projects.
- [ ] test - Mentor can create projects.
- [ ] test - Mentor can upload learning assets.
- [ ] test - Mentor can publish free projects.
- [ ] test - Mentor can publish premium projects.
- [ ] test - Mentor can view own revenue dashboard.
- [ ] test - Admin can manage users.
- [ ] test - Admin can manage mentors.
- [ ] test - Admin can moderate projects.
- [ ] test - Admin can view traffic analytics.
- [ ] test - Admin can view revenue analytics.

## Error Handling & Edge Cases - verify system robustness

- [ ] test - Invalid route returns not found page.
- [ ] test - Unauthorized access returns proper redirect or forbidden page.
- [ ] test - Network failure during payment shows recoverable error.
- [ ] test - Network failure during upload shows recoverable error.
- [ ] test - Empty project listing shows proper empty state.
- [ ] test - Deleted project cannot be accessed publicly.
- [ ] test - Deleted or unpublished premium project cannot be purchased.
- [ ] test - User cannot access stale premium URL without entitlement.
- [ ] test - Webhook retry does not corrupt payment or subscription state.
- [ ] test - Concurrent purchase attempts do not duplicate enrollment.
- [ ] test - Large project content loads without broken layout.
- [ ] test - Dashboard charts handle missing or zero values.
