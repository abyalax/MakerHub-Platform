# Product Requirements Document (PRD)

## Product Overview

The platform is a project-based learning marketplace inspired by Arduino Project Hub.

The goal is to enable learners to discover, learn, practice, and showcase skills through real-world projects while allowing mentors to monetize educational content and learning experiences.

The platform combines:

* Project-based learning
* Knowledge sharing
* Mentor-led classes
* Premium educational content
* Community-driven learning

---

# Product Vision

Build a scalable learning ecosystem where anyone can learn from practical projects, share knowledge, teach others, and monetize expertise.

---

# User Roles

## Guest

Unauthenticated visitors.

Capabilities:

* Browse projects
* Search projects
* View mentor profiles
* Access free projects
* View premium project previews

Restrictions:

* Cannot purchase content
* Cannot access premium learning materials
* Cannot track learning progress

---

## Learner

Registered users consuming educational content.

Capabilities:

* Access free projects
* Purchase premium classes
* Subscribe to premium plans
* Track learning progress
* Save/bookmark projects
* Access purchased content

---

## Mentor

Content creators and educators.

Capabilities:

* Create projects
* Create premium classes
* Upload educational materials
* Manage published content
* View learner engagement
* View revenue analytics

Supported learning assets:

* Images
* Videos
* PDF documents
* E-books
* Learning resources

---

## Admin

Platform operators.

Capabilities:

* Manage users
* Manage mentors
* Moderate projects
* Monitor platform activity
* Monitor revenue
* View business analytics

---

# Core Business Features

## Project Discovery

Users can:

* Browse projects
* Search projects
* Filter by category
* View featured projects
* View trending projects

Projects are visible to everyone.

Premium projects remain discoverable but require authentication and payment to access full content.

---

## Learning Projects

Each project contains:

* Title
* Description
* Objectives
* Learning materials
* Attachments
* Resources
* Assignments
* Completion criteria

Project Types:

* Free
* Premium

---

## Mentor Classes

Mentors can create educational classes around one or multiple projects.

Class Types:

* Free
* Paid

Paid classes are monetized through the platform.

Revenue is shared between mentor and platform according to configurable business rules.

---

## Learning Content Management

Mentors can upload:

* Cover images
* Learning images
* Educational videos
* PDF files
* E-books
* Supporting resources

Content can be organized into sections and lessons.

---

## Payments

Payment provider:

* Xendit

Supported payment models:

### One-Time Purchase

Learners purchase individual premium classes.

### Subscription

Recurring subscription plans grant access to premium content.

Subscription management is handled through Xendit recurring billing.

---

## User Progress

Learners can:

* Track enrolled classes
* Track completed projects
* View learning history
* Continue unfinished learning activities

---

# Admin Dashboard

## User Analytics

Metrics:

* Total users
* Registered learners
* Active learners
* New registrations

---

## Mentor Analytics

Metrics:

* Total mentors
* Active mentors
* Top-performing mentors

---

## Content Analytics

Metrics:

* Total projects
* Published projects
* Free projects
* Premium projects

---

## Traffic Analytics

Includes both authenticated and anonymous visitors.

Metrics:

* Daily visitors
* Weekly visitors
* Monthly visitors
* Yearly visitors
* Page views
* Popular projects

Anonymous visitors must be included in traffic reporting.

---

## Financial Analytics

Metrics:

* Gross revenue
* Net revenue
* Subscription revenue
* Class sales revenue
* Mentor payouts
* Pending payouts

---

# Mentor Dashboard

Metrics:

* Total projects
* Published projects
* Student enrollments
* Project views
* Revenue
* Monthly earnings
* Lifetime earnings

---

# Access Rules

## Free Projects

Accessible by:

* Guest
* Learner
* Mentor
* Admin

No login required.

---

## Premium Projects

Visible to everyone.

Full access requires:

* Authentication
* Successful payment or active subscription

---

# Future Feature (Phase 2)

## Live Learning

Status:

* Coming Soon
* Preview Only

The feature should appear in navigation and UI as a future capability but must not be implemented in MVP.

Potential future use cases:

* Live classes
* Webinars
* Group coaching
* Interactive workshops

Future business entities that should be considered during planning:

* Live Session
* Live Room
* Session Enrollment
* Session Attendance
* Session Recording
* Session Payment

The initial architecture and database planning should leave room for future integration without major redesign.

---

# MVP Scope

Included in V1:

## Guest

* Browse projects
* Search projects
* View mentors
* Access free projects

## Learner

* Registration
* Authentication
* Purchase premium classes
* Subscription access
* Learning progress tracking

## Mentor

* Create projects
* Upload videos
* Upload PDFs
* Upload images
* Publish free projects
* Publish premium projects
* Revenue dashboard

## Admin

* User management
* Mentor management
* Project moderation
* Traffic analytics
* Revenue analytics

## Payments

* Xendit one-time payment
* Xendit subscription billing

## UI

* Live Learning navigation item
* "Coming Soon" page for live learning

---

# Success Metrics

* Total registered learners
* Monthly active learners
* Number of published projects
* Number of premium classes
* Mentor retention rate
* Subscription conversion rate
* Revenue growth
* Project completion rate
* Weekly and monthly platform traffic
