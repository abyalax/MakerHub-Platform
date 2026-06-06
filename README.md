# Nuxt Layers Starter
Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

# Quick Start Guide - Nuxt 4 Layers Architecture

## Project Structure

```
project-root/
├── layers/                          # ALL application code
│   ├── shared/                      # Foundation layer (loaded first)
│   │   ├── app/
│   │   │   ├── app.vue             # Root component
│   │   │   ├── components/         # Shared UI & layouts
│   │   │   ├── composables/        # Shared composables
│   │   │   ├── layouts/            # Global layouts
│   │   │   ├── lib/                # Utilities
│   │   │   └── assets/css/         # Global CSS
│   │   ├── nuxt.config.ts
│   │   └── CLAUDE.md
│   │
│   ├── 1-auth/                     # Feature: Authentication
│   │   ├── app/
│   │   │   ├── components/         # Auth components
│   │   │   ├── composables/        # Auth logic (types, api, store)
│   │   │   ├── pages/              # Login page
│   │   │   └── middleware/         # Auth guard
│   │   ├── server/
│   │   │   ├── api/auth/          # Login, logout, register endpoints
│   │   │   └── utils/
│   │   ├── nuxt.config.ts
│   │   └── CLAUDE.md
│   │
│   └── 2-users/                    # Feature: User Management
│       ├── app/
│       │   ├── components/         # User components
│       │   ├── composables/        # User logic
│       │   ├── pages/users/        # Users list & detail
│       │   └── utils/
│       ├── server/
│       │   ├── api/users/         # User CRUD endpoints
│       │   └── utils/
│       ├── nuxt.config.ts
│       └── CLAUDE.md
│
├── nuxt.config.ts                  # Root configuration
├── package.json                    # Dependencies
└── LAYERS.md                       # Architecture documentation
```

---

## Key Concepts

### 1. Layer Priority (Alphabetical Order)
```
shared         → Priority 0 (loaded first)
1-auth         → Priority 1
2-users        → Priority 2
3-...          → Priority 3 (future features)
```

**Lower number = Foundation** | **Higher number = Override**

### 2. Naming Convention
- Layers: Use hyphens → `1-feature-name`
- Components: PascalCase → `<AuthCard />`
- Composables: camelCase → `useAuthStore()`

### 3. Auto-Imports (No manual import needed!)
```typescript
// ✅ Composables: Auto-imported
const authStore = useAuthStore()

// ✅ Components: Auto-imported by filename
<AuthCard />

// ❌ Utils: Manual import required
import { cn } from '~/layers/shared/app/lib/utils'
```

---

## Common Tasks

### Create a New Feature Layer

```bash
# 1. Create folder
mkdir layers/3-feature-name

# 2. Create minimal config
# layers/3-feature-name/nuxt.config.ts
export default defineNuxtConfig({})

# 3. Create documentation
# layers/3-feature-name/CLAUDE.md

# 4. Create directory structure
mkdir -p layers/3-feature-name/app/components
mkdir -p layers/3-feature-name/app/composables
mkdir -p layers/3-feature-name/app/pages
mkdir -p layers/3-feature-name/app/utils
mkdir -p layers/3-feature-name/server/api
mkdir -p layers/3-feature-name/server/utils
```

### Add a Composable

```typescript
// layers/1-auth/app/composables/useAuthForm.ts
export function useAuthForm() {
  const form = useForm({
    validationSchema: toTypedSchema(loginSchema)
  })
  
  return {
    form,
    // ... methods
  }
}

// ✅ Auto-imported in components - no import needed!
<script setup>
const { form } = useAuthForm()
</script>
```

### Add a Component

```vue
<!-- layers/1-auth/app/components/AuthCard.vue -->
<template>
  <div class="auth-card">
    <!-- Form content -->
  </div>
</template>

<!-- ✅ Auto-imported as <AuthCard /> -->
```

### Add an API Route

```typescript
// layers/1-auth/server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  
  // Validate & authenticate
  
  return {
    token: 'jwt-token',
    user: { id: '1', email }
  }
})

// ✅ Available as POST /api/auth/login
```

### Add State with Pinia

```typescript
// layers/2-users/app/composables/useUsersStore.ts
import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  
  async function fetchUsers() {
    loading.value = true
    try {
      users.value = await $fetch('/api/users')
    } finally {
      loading.value = false
    }
  }
  
  return { users, loading, fetchUsers }
})

// ✅ Use in any component
const store = useUsersStore()
await store.fetchUsers()
```

### Use Form Validation (vee-validate)

```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars')
})

const { handleSubmit, values } = useForm({
  validationSchema: toTypedSchema(schema)
})
</script>

<template>
  <VeeForm @submit="handleSubmit(onSubmit)">
    <VeeField name="email" />
    <VeeField name="password" type="password" />
    <button type="submit">Login</button>
  </VeeForm>
</template>
```

---

## Important Rules

### ✅ DO:
- ✅ Keep layers independent
- ✅ Put feature code in feature layer (not shared)
- ✅ Use Pinia for state management
- ✅ Validate on server-side
- ✅ Type your data with TypeScript
- ✅ Document each layer with CLAUDE.md

### ❌ DON'T:
- ❌ Create root-level `app/` folder
- ❌ Mix feature logic with shared layer
- ❌ Use prop drilling (use Pinia instead)
- ❌ Import utilities without checking auto-import first
- ❌ Trust client-side validation alone
- ❌ Create unnumbered layers (always use {N}-pattern)

---

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Check code style
pnpm lint:fix         # Auto-fix code style issues

# Dependencies
pnpm install          # Install dependencies
pnpm add package      # Add new dependency
```

---

## File Locations Quick Reference

| Type | Location | Auto-Import |
| --- | --- | --- |
| Component | `app/components/*.vue` | ✅ Yes |
| Composable | `app/composables/*.ts` | ✅ Yes |
| Page | `app/pages/**/*.vue` | ✅ Yes |
| Layout | `app/layouts/*.vue` | ✅ Yes |
| Middleware | `app/middleware/*.ts` | ✅ Yes |
| Plugin | `app/plugins/*.ts` | ✅ Yes |
| Utility | `app/utils/*.ts` | ❌ No |
| API Route | `server/api/**/*.ts` | ✅ Yes |
| Type | Via `#alias` | Via alias |

---

## Data Flow Pattern

```
Component
    ↓
Composable (useStore)
    ↓
Pinia Store (manages state)
    ↓
API Service (useApi)
    ↓
$fetch / useFetch
    ↓
Server API Route
    ↓
Database / External Service
```

---

## Layer Documentation

Each layer should have `CLAUDE.md` explaining:
- Layer purpose and features
- Available components & composables
- API endpoints
- Usage examples
- Testing notes

See existing CLAUDE.md files for templates.

---

## Need Help?

1. Check `LAYERS.md` for comprehensive architecture guide
2. Review `CLAUDE.md` in each layer for details
3. Look at existing implementations in layers/shared, layers/1-auth
4. Run `pnpm lint` to catch issues early

--

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
