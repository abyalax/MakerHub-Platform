# 3-Projects Layer - Project Management Feature

**Status**: ✅ Feature Layer  
**Priority**: 3 (Loaded after 2-users)  
**Dependencies**: shared, 1-auth, 2-users

## Overview

The `3-projects` layer manages project-related functionality including:
- Project management pages
- Project CRUD operations
- Project display components
- Admin project list
- Mentor project management

## Architecture

```
layers/3-projects/
├── app/
│   ├── components/
│   │   ├── ProjectCard.vue         # Project card display
│   │   ├── ProjectForm.vue         # Project edit form
│   │   └── ProjectList.vue         # Project list component
│   ├── composables/
│   │   ├── types.ts                # Project types/interfaces
│   │   ├── useGetProjects.ts       # GET projects composable
│   │   ├── useCreateProject.ts     # Create project composable
│   │   ├── useUpdateProject.ts     # Update project composable
│   │   ├── useDeleteProject.ts     # Delete project composable
│   │   └── useProjectsStore.ts     # Pinia store
│   ├── pages/
│   │   └── projects/
│   │       ├── index.vue           # Projects list page
│   │       └── [id].vue            # Project detail page
│   ├── layouts/
│   │   └── projects.vue            # Projects-specific layout
│   ├── middleware/
│   │   └── projects-guard.ts       # Access control
│   └── utils/
│       └── projects.ts             # Project utilities
├── server/
│   ├── api/
│   │   └── projects/
│   │       ├── index.get.ts        # GET /api/projects (list)
│   │       ├── index.post.ts       # POST /api/projects (create)
│   │       ├── [id].get.ts         # GET /api/projects/:id
│   │       ├── [id].put.ts         # PUT /api/projects/:id (update)
│   │       └── [id].delete.ts      # DELETE /api/projects/:id
│   ├── middleware/
│   │   └── projects-logger.ts
│   └── utils/
│       └── projects.ts
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Projects List (`pages/projects/index.vue`)
- Display all projects in a table
- Search/filter projects
- Pagination
- Action buttons (view, edit, delete)
- Create new project button

#### Project Detail (`pages/projects/[id].vue`)
- Display single project details
- Edit project form
- Project activity log
- Delete option

### Components

#### ProjectCard.vue
Card component for displaying project information:
- Project image/thumbnail
- Title
- Description
- Status
- Action buttons

#### ProjectForm.vue
Form for creating/editing projects:
- Text inputs (title, description, etc.)
- Form validation
- Submit handling
- Error messages

### State Management

**useProjectsStore** (Pinia)
```typescript
state: {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

actions: {
  fetchAll()
  fetchById(id)
  create(data)
  update(id, data)
  delete(id)
  setCurrentProject(project)
}
```

### API Composables

**TanStack Query Pattern:**
- `useGetProjects(params)` - Fetch all projects with pagination
- `useCreateProject()` - Create project mutation
- `useUpdateProject()` - Update project mutation
- `useDeleteProject()` - Delete project mutation

## Server Routes

### GET /api/projects
Fetch all projects with optional filtering/pagination.

Query params:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search query
- `sort` - Sort field
- `order` - Sort order (asc/desc)

Response:
```typescript
{
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/projects
Create new project.

Body:
```typescript
{
  title: string
  description: string
  mentorId: number
  status: 'draft' | 'published' | 'archived'
}
```

Response:
```typescript
{ project: Project }
```

### GET /api/projects/:id
Fetch single project by ID.

### PUT /api/projects/:id
Update project by ID.

Body:
```typescript
{
  title?: string
  description?: string
  status?: string
}
```

### DELETE /api/projects/:id
Delete project by ID.

## Types

```typescript
interface Project {
  id: string
  title: string
  description: string
  mentorId: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

interface CreateProjectData {
  title: string
  description: string
  mentorId: number
  status?: string
}

interface UpdateProjectData {
  title?: string
  description?: string
  status?: string
}
```

## Form Validation

Using Zod validators:

```typescript
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  mentorId: z.number().positive('Mentor ID is required'),
})
```

## Usage Example

### In Component
```vue
<script setup lang="ts">
const params = computed(() => ({
  page: 1,
  limit: 20,
}))

const { data, isLoading } = useGetProjects(params)
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <ProjectCard 
        v-for="project in data?.projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
```

## Security

- ✅ Role-based access (admin/mentor only)
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ Middleware guards

## Performance

- Pagination for large datasets
- Lazy loading components
- Caching with TanStack Query
- Server-side filtering

## Testing

- Unit tests: `tests/unit/projects/`
- E2E tests: `tests/e2e/projects/`
- Component tests: `tests/nuxt/projects/`

## Notes

- Projects management requires admin or mentor role
- Implement proper access control
- Validate all server-side inputs
- Cache project data when appropriate

---

**Last Updated**: June 2026  
**Nuxt Version**: 4.3+
