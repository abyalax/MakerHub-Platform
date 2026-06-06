# 2-Users Layer - User Management Feature

**Status**: ✅ Feature Layer  
**Priority**: 2 (Loaded after 1-auth)  
**Dependencies**: shared, 1-auth

## Overview

The `2-users` layer manages user-related functionality including:
- User management pages
- User CRUD operations
- User profile component
- Admin user list

## Architecture

```
layers/2-users/
├── app/
│   ├── components/
│   │   ├── UserCard.vue         # User card display
│   │   ├── UserForm.vue         # User edit form
│   │   └── UserAvatar.vue       # User avatar
│   ├── composables/
│   │   ├── types.ts             # User types/interfaces
│   │   ├── useUsersApi.ts       # API service
│   │   ├── useUsersStore.ts     # Pinia store
│   │   ├── useUserForm.ts       # Form logic
│   │   └── useUserValidators.ts # Zod validators
│   ├── pages/
│   │   └── users/
│   │       ├── index.vue        # Users list page
│   │       └── [id].vue         # User detail page
│   ├── layouts/
│   │   └── users.vue            # Users-specific layout
│   ├── middleware/
│   │   └── users-guard.ts       # Access control
│   └── utils/
│       └── users.ts             # User utilities
├── server/
│   ├── api/
│   │   └── users/
│   │       ├── index.get.ts     # GET /api/users (list)
│   │       ├── index.post.ts    # POST /api/users (create)
│   │       ├── [id].get.ts      # GET /api/users/:id
│   │       ├── [id].put.ts      # PUT /api/users/:id (update)
│   │       └── [id].delete.ts   # DELETE /api/users/:id
│   ├── middleware/
│   │   └── users-logger.ts
│   └── utils/
│       └── users.ts
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Pages

#### Users List (`pages/users/index.vue`)
- Display all users in a table
- Search/filter users
- Pagination
- Action buttons (view, edit, delete)
- Create new user button

#### User Detail (`pages/users/[id].vue`)
- Display single user details
- Edit user form
- User activity log
- Delete option

### Components

#### UserCard.vue
Card component for displaying user information:
- Avatar
- Name
- Email
- Status
- Action buttons

#### UserForm.vue
Form for creating/editing users:
- Text inputs (name, email, etc.)
- Form validation
- Submit handling
- Error messages

#### UserAvatar.vue
Avatar component:
- User image
- Fallback initials
- Size variants
- Status indicator

### State Management

**useUsersStore** (Pinia)
```typescript
state: {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
}

actions: {
  fetchAll()
  fetchById(id)
  create(data)
  update(id, data)
  delete(id)
  setCurrentUser(user)
}
```

### API Service

**useUsersApi**
- `getAll(filters?: Filters)` - Fetch all users
- `getById(id: string)` - Fetch single user
- `create(data: CreateUserData)` - Create user
- `update(id: string, data: UpdateUserData)` - Update user
- `delete(id: string)` - Delete user
- `search(query: string)` - Search users

## Server Routes

### GET /api/users
Fetch all users with optional filtering/pagination.

Query params:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search query
- `sort` - Sort field
- `order` - Sort order (asc/desc)

Response:
```typescript
{
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/users
Create new user.

Body:
```typescript
{
  name: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
}
```

Response:
```typescript
{ user: User }
```

### GET /api/users/:id
Fetch single user by ID.

### PUT /api/users/:id
Update user by ID.

Body:
```typescript
{
  name?: string
  email?: string
  role?: string
  status?: string
}
```

### DELETE /api/users/:id
Delete user by ID.

## Types

```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

interface CreateUserData {
  name: string
  email: string
  role?: string
  status?: string
}

interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  status?: string
}
```

## Form Validation

Using Zod validators:

```typescript
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['user', 'admin']),
})
```

## Usage Example

### In Component
```vue
<script setup lang="ts">
const usersStore = useUsersStore()

onMounted(() => {
  usersStore.fetchAll()
})
</script>

<template>
  <div>
    <div v-if="usersStore.loading">Loading...</div>
    <div v-else>
      <UserCard 
        v-for="user in usersStore.users"
        :key="user.id"
        :user="user"
      />
    </div>
  </div>
</template>
```

## Security

- ✅ Role-based access (admin only)
- ✅ Server-side validation
- ✅ Protected API routes
- ✅ Middleware guards

## Performance

- Pagination for large datasets
- Lazy loading components
- Caching with Pinia
- Server-side filtering

## Testing

- Unit tests: `tests/unit/users/`
- E2E tests: `tests/e2e/users/`
- Component tests: `tests/nuxt/users/`

## Notes

- Users management requires admin role
- Implement proper access control
- Validate all server-side inputs
- Cache user data when appropriate

---

**Last Updated**: February 2026  
**Nuxt Version**: 4.3+
