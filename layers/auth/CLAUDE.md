# 1-Auth Layer - Authentication Feature

**Status**: ✅ Feature Layer  
**Priority**: 1 (Loaded after shared)  
**Dependencies**: shared

## Overview

The `1-auth` layer manages user authentication including:
- Login/Register pages
- Authentication middleware
- Auth context and state
- Auth API routes

## Architecture

```
layers/1-auth/
├── app/
│   ├── components/              # Auth-specific components
│   │   └── AuthCard.vue
│   ├── composables/
│   │   ├── types.ts            # Auth types/interfaces
│   │   ├── useAuthApi.ts       # API service
│   │   ├── useAuthStore.ts     # Pinia auth store
│   │   └── useAuthForm.ts      # Form validation
│   ├── pages/
│   │   └── login.vue           # Login page
│   ├── layouts/
│   │   └── auth.vue            # Auth-specific layout
│   ├── middleware/
│   │   └── auth.global.ts      # Global auth guard
│   └── utils/
│       └── auth.ts             # Auth utilities
├── server/
│   ├── api/
│   │   └── auth/
│   │       ├── login.post.ts
│   │       ├── logout.post.ts
│   │       ├── register.post.ts
│   │       ├── verify.get.ts
│   │       └── refresh.post.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── utils/
│       └── auth.ts
├── nuxt.config.ts
└── CLAUDE.md
```

## Key Features

### Authentication Pages
- **Login Page** (`pages/login.vue`)
  - Email/password input
  - Form validation with vee-validate
  - Submit to `/api/auth/login`
  
- **Register Page** (optional)
  - User registration
  - Email verification
  - Password confirmation

### Middleware
- **auth.global.ts** - Protects routes requiring authentication
  - Redirects unauthenticated users to login
  - Can be disabled with `defineRouteRules`

### State Management
- **useAuthStore** (Pinia)
  - Current user state
  - Auth token state
  - Login/logout actions
  - User profile

### API Service
- **useAuthApi**
  - Login
  - Logout
  - Register
  - Verify token
  - Refresh token

## Server Routes

### POST /api/auth/login
```typescript
{
  email: string
  password: string
}
→ { token: string, user: User }
```

### POST /api/auth/logout
```typescript
→ { success: boolean }
```

### POST /api/auth/register
```typescript
{
  email: string
  password: string
  name: string
}
→ { token: string, user: User }
```

### GET /api/auth/verify
Verify if current auth token is valid.

### POST /api/auth/refresh
Refresh auth token.

## Usage

### In Components
```vue
<script setup lang="ts">
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div v-if="isLoggedIn">
    Welcome, {{ authStore.user?.name }}!
  </div>
  <div v-else>
    Please log in.
  </div>
</template>
```

### Protecting Routes
```typescript
// In page component
defineRouteRules({
  prerender: false,
  ssr: false
})

export default defineEventHandler(async (event) => {
  await useAuthMiddleware(event)
  // Route is now protected
})
```

## Configuration

### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  // Auto-imports from app/composables/ and app/components/
})
```

## Dependencies

- Pinia (state management)
- vee-validate (form validation)
- Server session/token storage

## Auto-Imports

### Components
- `<AuthCard />` - Auth form wrapper component

### Composables
- `useAuthStore()` - Auth state
- `useAuthApi()` - Auth service
- `useAuthForm()` - Auth form logic

## Testing

- Unit tests: `tests/unit/auth/`
- E2E tests: `tests/e2e/auth/`
- Component tests: `tests/nuxt/auth/`

## Notes

- Token storage: Handle securely (HttpOnly cookies recommended)
- Protected routes: Use middleware or route rules
- User context: Available via `useAuthStore().user`
- Logout: Clear tokens and redirect to login

---

**Last Updated**: February 2026  
**Nuxt Version**: 4.3+
