# Bookmarks Layer - Bookmark & Learning Library Feature

**Status**: ✅ Feature Layer  
**Priority**: 9 (Loaded after 8-admin-analytics)  
**Dependencies**: shared, 1-auth, 2-users, 4-enrollments, 5-progress

## Overview

The `bookmarks` layer manages bookmark and learning library functionality including:
- Save projects to library
- Mark saved projects as favorites
- Continue learning from last accessed lesson
- Learning progress tracking

## Architecture

```
layers/bookmarks/
├── app/
│   ├── components/
│   │   ├── BookmarkButton.vue        # Bookmark toggle button
│   │   ├── FavoriteButton.vue       # Favorite toggle button
│   │   └── LearningLibraryCard.vue  # Library card component
│   ├── composables/
│   │   ├── types.ts                 # Bookmark types/interfaces
│   │   ├── useBookmarksApi.ts       # API service
│   │   └── useBookmarksStore.ts     # Pinia store
│   └── pages/
│       └── library/
│           └── index.vue            # Learning library page
├── server/
│   └── api/
│       └── bookmarks/
│           ├── index.get.ts         # GET /api/bookmarks
│           ├── index.post.ts        # POST /api/bookmarks
│           ├── [id].delete.ts       # DELETE /api/bookmarks/:id
│           └── [id].favorite.put.ts # PUT /api/bookmarks/:id/favorite
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Learning Library (`pages/library/index.vue`)
- Display all saved projects
- Show favorite status
- Display learning progress
- Continue learning button
- Remove bookmark option

### Components

#### BookmarkButton.vue
Button to toggle bookmark status:
- Bookmark/unbookmark action
- Visual feedback
- Loading state

#### FavoriteButton.vue
Button to toggle favorite status:
- Favorite/unfavorite action
- Star icon
- Visual feedback

#### LearningLibraryCard.vue
Card for library items:
- Project details
- Progress bar
- Favorite status
- Continue learning button
- Remove bookmark button

### State Management

**useBookmarksStore** (Pinia)
```typescript
state: {
  bookmarks: Bookmark[]
  loading: boolean
  error: string | null
}

actions: {
  fetchBookmarks()
  addBookmark(projectId)
  removeBookmark(id)
  toggleFavorite(id)
}
```

### API Service

**useBookmarksApi**
- `getBookmarks()` - Fetch user's bookmarks
- `addBookmark(projectId)` - Add bookmark
- `removeBookmark(id)` - Remove bookmark
- `toggleFavorite(id)` - Toggle favorite status

## Server Routes

### GET /api/bookmarks
Fetch user's bookmarks with project details and progress.

Response:
```typescript
{
  bookmarks: BookmarkWithDetails[]
}
```

### POST /api/bookmarks
Add a bookmark for a project.

Body:
```typescript
{
  projectId: number
}
```

### DELETE /api/bookmarks/:id
Remove a bookmark.

### PUT /api/bookmarks/:id/favorite
Toggle favorite status of a bookmark.

## Types

```typescript
interface Bookmark {
  id: number;
  userId: number;
  projectId: number | null;
  classId: number | null;
  createdAt: string;
}

interface BookmarkWithDetails extends Bookmark {
  project?: {
    id: number;
    title: string;
    slug: string;
    coverAsset?: MediaAsset;
  };
  progress?: {
    progressPercent: number;
    lastAccessed: string;
  };
  isFavorite: boolean;
}
```

## Security

- ✅ User-specific data access
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ Authentication required

## Performance

- Efficient queries with Prisma
- Database indexing on userId and projectId
- Caching with Pinia
- Duplicate bookmark prevention

## Testing

- Unit tests: `tests/unit/bookmarks/`
- E2E tests: `tests/e2e/bookmarks/`

## Notes

- Duplicate bookmarks prevented
- Favorite status persisted across sessions
- Learning progress integrated with progress layer
- Bookmarks accessible from learning library page

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
