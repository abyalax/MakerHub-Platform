# Enrollments Layer - Learning Library Feature

**Status**: ✅ Feature Layer  
**Priority**: 4 (Loaded after 3-payments)  
**Dependencies**: shared, 1-auth, 2-users, 3-payments

## Overview

The `enrollments` layer manages learner enrollment functionality including:
- Project enrollment after purchase
- My Learning library page
- Continue learning feature
- Learning history tracking

## Architecture

```
layers/enrollments/
├── app/
│   ├── components/
│   │   ├── LearningCard.vue        # Learning card display
│   │   ├── ContinueLearning.vue    # Continue learning button
│   │   └── EnrollmentStatus.vue    # Enrollment status badge
│   ├── composables/
│   │   ├── types.ts                # Enrollment types/interfaces
│   │   ├── useEnrollmentsApi.ts    # API service
│   │   └── useEnrollmentsStore.ts  # Pinia store
│   └── pages/
│       └── learning/
│           └── index.vue           # My Learning page
├── server/
│   └── api/
│       ├── enrollments/
│       │   └── index.get.ts        # GET /api/enrollments
│       └── learning/
│           ├── index.get.ts        # GET /api/learning (library)
│           └── continue.get.ts     # GET /api/learning/continue
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### My Learning (`pages/learning/index.vue`)
- Display all enrolled projects
- Show enrollment status
- Display learning progress percentage
- Navigate directly to learning content
- Sort by recent activity

### Components

#### LearningCard.vue
Card component for enrolled projects:
- Project title and cover
- Progress percentage
- Enrollment status
- Continue learning button
- Last accessed date

#### ContinueLearning.vue
Button to resume from last lesson:
- Shows last visited lesson
- Quick navigation
- Progress indicator

#### EnrollmentStatus.vue
Status badge for enrollment:
- Active, Completed, Canceled states
- Color-coded badges

### State Management

**useEnrollmentsStore** (Pinia)
```typescript
state: {
  enrollments: Enrollment[]
  currentEnrollment: Enrollment | null
  loading: boolean
  error: string | null
}

actions: {
  fetchAll()
  fetchById(id)
  getContinueLearning()
}
```

### API Service

**useEnrollmentsApi**
- `getAll(filters?: Filters)` - Fetch all enrollments
- `getById(id: string)` - Fetch single enrollment
- `getContinueLearning()` - Get last accessed lesson

## Server Routes

### GET /api/enrollments
Fetch all enrollments for authenticated user.

Query params:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status

Response:
```typescript
{
  enrollments: Enrollment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### GET /api/learning
Fetch learning library for authenticated user.

Response:
```typescript
{
  projects: ProjectWithProgress[]
  lastAccessed: Date | null
}
```

### GET /api/learning/continue
Get last accessed lesson for continuing learning.

Response:
```typescript
{
  projectId: number
  lessonId: number
  lessonTitle: string
  projectTitle: string
}
```

## Types

```typescript
interface Enrollment {
  id: number
  userId: number
  projectId: number
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED'
  progressPercent: number
  enrolledAt: string
  completedAt: string | null
  project?: {
    id: number
    title: string
    slug: string
    coverAsset?: MediaAsset
  }
}

interface ProjectWithProgress {
  id: number
  title: string
  slug: string
  progressPercent: number
  lastAccessed: string
  status: 'ACTIVE' | 'COMPLETED'
}
```

## Security

- ✅ User-specific data access
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ Authentication required

## Performance

- Pagination for large datasets
- Progress calculation optimization
- Caching with Pinia
- Database indexing on userId and projectId

## Testing

- Unit tests: `tests/unit/enrollments/`
- E2E tests: `tests/e2e/enrollments/`

## Notes

- Enrollments created automatically on successful payment
- Progress calculated from lesson completion
- Last accessed tracked on content view
- Duplicate enrollments prevented

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
