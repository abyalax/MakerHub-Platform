# Nuxt 4 Layers Architecture Guide

Dokumentasi komprehensif tentang Nuxt 4 Layers untuk implementasi di project lain. **Designed for AI Agents**.

---

## 📚 Table of Contents

1. [Core Concepts](#core-concepts)
2. [Architecture Overview](#architecture-overview)
3. [File Structure](#file-structure)
4. [Configuration](#configuration)
5. [Layer Priority System](#layer-priority-system)
6. [Auto-Import Rules](#auto-import-rules)
7. [Feature Layer Template](#feature-layer-template)
8. [Data Flow Pattern](#data-flow-pattern)
9. [Implementation Checklist](#implementation-checklist)
10. [Common Patterns](#common-patterns)

---

## Core Concepts

### What are Nuxt Layers?

Nuxt Layers is a powerful feature of **Nuxt 4** that allows you to create a modular, composable architecture where:

- Each layer can have its own `nuxt.config.ts`
- Layers can extend/override other layers
- Layers are automatically scanned from `~/layers/` directory
- Each layer is completely independent and reusable

### Why Use Layers?

1. **Modularity**: Each feature is isolated and self-contained
2. **Reusability**: Layers can be copied or extracted as packages
3. **Scalability**: Easy to add new features without touching existing code
4. **Team Collaboration**: Different teams can work on different layers
5. **Composability**: Combine layers to create complex applications

### Key Principle: "Everything is a Layer"

In this architecture, **there is no root `app/` folder**. Everything lives inside layers:

- Foundation (UI, CSS, utils) = `layers/shared/`
- Features = `layers/1-feature-name/`, `layers/2-another-feature/`, etc.
- Server/API routes = Inside each layer's `server/` folder

---

## Architecture Overview

```
project-root/
├── layers/                          # ALL application code lives here
│   ├── shared/                      # Foundation layer (highest dependency)
│   │   ├── app/
│   │   │   ├── components/ui/       # shadcn-vue components (auto-import)
│   │   │   ├── assets/css/          # Global CSS
│   │   │   ├── utils/               # Pure utility functions
│   │   │   ├── app.vue              # Root component
│   │   │   ├── error.vue            # Error page
│   │   │   ├── layouts/
│   │   │   └── pages/
│   │   ├── shared/
│   │   │   └── types/               # Global types
│   │   ├── server/api/              # Global API routes
│   │   └── nuxt.config.ts           # Configuration
│   │
│   ├── example/                   # Feature layer (example)
│   │   ├── app/
│   │   │   ├── components/          # Feature-specific components
│   │   │   ├── composables/
│   │   │   │   ├── types.ts         # Feature types
│   │   │   │   ├── useExampleApi.ts # API service
│   │   │   │   ├── useExampleStore.ts # Pinia store
│   │   │   │   └── ...              # Other composables
│   │   │   ├── pages/               # Feature pages
│   │   │   ├── layouts/             # Feature layouts
│   │   │   ├── plugins/             # Feature plugins
│   │   │   ├── middleware/          # Feature middleware
│   │   │   └── utils/               # Feature utilities
│   │   ├── server/
│   │   │   ├── api/                 # Feature CRUD routes
│   │   │   ├── middleware/          # Server middleware
│   │   │   ├── plugins/             # Server plugins
│   │   │   └── utils/               # Server utilities
│   │   ├── CLAUDE.md                # Feature documentation
│   │   └── nuxt.config.ts           # Configuration (can be empty)
│   │
│   └── 2-another-feature/           # Additional feature layer
│       └── ... (same structure as example)
│
├── tests/                           # Tests (organized by type)
│   ├── unit/                        # Vitest unit tests
│   ├── nuxt/                        # Nuxt component tests
│   ├── e2e/                         # Playwright E2E tests
│   └── setup.ts
│
├── public/                          # Static assets
├── nuxt.config.ts                   # Root configuration
├── tsconfig.json
├── package.json
└── eslint.config.mjs
```

---

## File Structure

### Root Level

**nuxt.config.ts** (Root Configuration)

- **Must exist** in project root
- Registers all Nuxt modules (Pinia, vee-validate, shadcn, etc.)
- Security configuration (nuxt-security, nuxt-csurf)
- Global metadata and SEO
- Module metadata pointing to layer component directories
- **Does NOT define layers** - Nuxt 4 auto-scans `~/layers/`

### Layer Level

Each layer **must have** `nuxt.config.ts` (can be minimal or empty).

**Minimal layer config:**

```typescript
export default defineNuxtConfig({
  // Can be completely empty
})
```

**With CSS and aliases:**

```typescript
export default defineNuxtConfig({
  css: ['~/layers/shared/app/assets/css/main.css'],
  alias: {
    '#shared': '../layers/shared/shared'
  }
})
```

---

## Configuration

### Root nuxt.config.ts

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // === MODULES (in order of dependency) ===
  modules: [
    '@nuxt/eslint',
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    'nuxt-security',
    'nuxt-csurf'
  ],

  // === LAYER-SPECIFIC CONFIG ===
  shadcn: {
    prefix: '',
    componentDir: './layers/shared/app/components/ui' // Where shadcn components go
  },

  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage'
    }
  },

  // === SECURITY ===
  security: {
    headers: {
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        /* ... */
      }
    },
    rateLimiter: {
      /* ... */
    },
    xssValidator: {},
    requestSizeLimiter: {
      /* ... */
    }
  },

  csurf: {
    https: process.env.NODE_ENV === 'production',
    cookieKey: 'csrf',
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
  },

  // === RUNTIME CONFIG ===
  runtimeConfig: {
    // Private (server only)
    private: {
      dbUrl: process.env.DATABASE_URL
    },
    // Public (exposed to client)
    public: {
      apiBaseUrl: process.env.API_BASE_URL || '/api'
    }
  },

  // === BUILD OPTIMIZATION ===
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'esbuild',
      assetsInlineLimit: 4096
    }
  }
})
```

### Layer nuxt.config.ts

**Minimal (Feature Layer):**

```typescript
export default defineNuxtConfig({
  // Auto-imports work automatically for:
  // - app/components/ (prefixed with component name)
  // - app/composables/ (any file name)
  // - app/pages/ (file system routing)
  // No configuration needed unless customizing
})
```

**With CSS (shared Layer):**

```typescript
export default defineNuxtConfig({
  css: ['~/layers/shared/app/assets/css/main.css'],
  alias: {
    '#shared': '../layers/shared/shared'
  }
})
```

---

## Layer Priority System

### How Layer Priority Works

Nuxt 4 **automatically scans** `~/layers/` and loads layers in alphabetical order:

- **Lower number = lower priority** (foundation)
- **Higher number = higher priority** (overrides)

### Priority Order Example

```
layers/shared/       ← Foundation (loaded first, lowest priority)
layers/example/    ← Feature (loaded second, overrides shared)
layers/2-advanced/   ← Feature (loaded third, highest priority)
```

### File Override Example

If both layers define the same file:

```
layers/shared/app/pages/index.vue         (shared version shown)
layers/example/app/pages/index.vue      (example overrides - THIS is shown)
```

### Naming Convention

Use **hyphens** (not dots) in layer names:

- ✅ `layers/1-user-management/`
- ✅ `layers/2-payment-gateway/`
- ❌ ~~`layers/1.user.management/`~~

---

## Auto-Import Rules

Nuxt 4 automatically imports files from layers without manual declaration.

### Composables (Auto-imported)

**File**: `layers/example/app/composables/useExampleStore.ts`
**Import**: Automatically available as `useExampleStore()` (no import needed)

```typescript
// In any component/page/composable
const exampleStore = useExampleStore() // Automatically imported
```

### Components (Auto-imported with Prefix)

**File**: `layers/example/app/components/ExampleCard.vue`
**Import**: `<ExampleCard />` (file name becomes component name)

**File**: `layers/shared/app/components/ui/button/Button.vue`
**Import**: `<Button />` (from ui/ subdirectory)

### Utils (Manual Import)

**File**: `layers/example/app/utils/helpers.ts`
**Import**: Must manually import

```typescript
import { helperFunction } from '~/layers/example/app/utils/helpers'
```

### API Routes (Automatic)

All routes in `/server/api/` are automatically available regardless of layer:

- `layers/shared/server/api/health.get.ts` → `GET /api/health`
- `layers/example/server/api/example/index.get.ts` → `GET /api/example`

### Types (Manual Import via Alias)

**Define in layer nuxt.config.ts**:

```typescript
export default defineNuxtConfig({
  alias: {
    '#shared': '../layers/shared/shared'
  }
})
```

**Use in any file**:

```typescript
import type { GlobalType } from '#shared/types'
```

---

## Feature Layer Template

### Complete Directory Structure

```
layers/{N}-{feature-name}/
├── nuxt.config.ts                    # REQUIRED
├── CLAUDE.md                         # Feature documentation
│
├── app/                              # Client-side code
│   ├── components/
│   │   └── {Feature}Card.vue         # Use feature name prefix
│   │
│   ├── composables/
│   │   ├── types.ts                  # Interface exports
│   │   ├── use{Feature}Api.ts        # Service layer ($fetch)
│   │   ├── use{Feature}Store.ts      # Pinia store
│   │   ├── use{Feature}Form.ts       # Form logic
│   │   └── use{Feature}Validators.ts # Zod/validators
│   │
│   ├── pages/
│   │   └── {feature}/
│   │       ├── index.vue             # List page
│   │       └── [id].vue              # Detail page
│   │
│   ├── layouts/
│   │   └── {feature}.vue             # Feature-specific layout
│   │
│   ├── plugins/
│   │   └── {feature}.ts              # Feature initialization
│   │
│   ├── middleware/
│   │   └── {feature}-guard.ts        # Route protection
│   │
│   └── utils/
│       └── {feature}.ts              # Pure utilities
│
└── server/                           # Server-side code
    ├── api/
    │   └── {feature}/
    │       ├── index.get.ts          # GET /api/{feature}
    │       ├── index.post.ts         # POST /api/{feature}
    │       ├── [id].get.ts           # GET /api/{feature}/:id
    │       ├── [id].put.ts           # PUT /api/{feature}/:id
    │       └── [id].delete.ts        # DELETE /api/{feature}/:id
    │
    ├── middleware/
    │   └── {feature}-logger.ts       # Custom middleware
    │
    ├── plugins/
    │   └── {feature}.ts              # Server initialization
    │
    └── utils/
        └── {feature}.ts              # Server utilities
```

---

## Data Flow Pattern

### Recommended Architecture Flow

```
UI Component
    ↓
Composable Hook (useExampleStore)
    ↓
Pinia Store (manages state)
    ↓
API Service (useExampleApi)
    ↓
$fetch or useFetch
    ↓
Server API Route
    ↓
Database / External Service
```

### Example Implementation

**1. Type Definition** (`types.ts`)

```typescript
export interface Example {
  id: string
  name: string
  createdAt: string
}

export interface CreateExampleData {
  name: string
}
```

**2. API Service** (`useExampleApi.ts`)

```typescript
import type { Example, CreateExampleData } from './types'

export function useExampleApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  async function getAll(): Promise<Example[]> {
    return $fetch(`${baseUrl}/examples`)
  }

  async function create(data: CreateExampleData): Promise<Example> {
    return $fetch(`${baseUrl}/examples`, {
      method: 'POST',
      body: data
    })
  }

  return { getAll, create }
}
```

**3. Pinia Store** (`useExampleStore.ts`)

```typescript
import { defineStore } from 'pinia'
import type { Example } from './types'

export const useExampleStore = defineStore('example', () => {
  const items = ref<Example[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const api = useExampleApi()

  async function fetchAll() {
    loading.value = true
    try {
      items.value = await api.getAll()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchAll }
})
```

**4. Component Usage** (`ExampleCard.vue`)

```vue
<script setup lang="ts">
const exampleStore = useExampleStore()

onMounted(() => {
  exampleStore.fetchAll()
})
</script>

<template>
  <div>
    <div v-if="exampleStore.loading">Carregando...</div>
    <div v-else>
      <div v-for="item in exampleStore.items" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

**5. Server API Route** (`server/api/example/index.get.ts`)

```typescript
import { defineEventHandler } from 'h3'

export default defineEventHandler(async event => {
  try {
    const examples = await fetchExamplesFromDb()
    return examples
  } catch (error) {
    throw createError({ statusCode: 500, message: String(error) })
  }
})
```

---

## Implementation Checklist

### When Creating a New Feature Layer

- [ ] Create folder: `layers/{N}-{feature-name}/`
- [ ] Create `nuxt.config.ts` (can be empty)
- [ ] Create `CLAUDE.md` (documentation)
- [ ] Create `app/composables/types.ts` (TypeScript interfaces)
- [ ] Create `app/composables/use{Feature}Api.ts` (API service)
- [ ] Create `app/composables/use{Feature}Store.ts` (State management)
- [ ] Create `app/components/{Feature}Card.vue` (UI components)
- [ ] Create `app/pages/{feature}/index.vue` (List/main page)
- [ ] Create `server/api/{feature}/` directory
- [ ] Create `server/api/{feature}/index.get.ts` (GET all)
- [ ] Create `server/api/{feature}/index.post.ts` (Create)
- [ ] Create `server/api/{feature}/[id].get.ts` (Get by ID)
- [ ] Create `server/api/{feature}/[id].put.ts` (Update)
- [ ] Create `server/api/{feature}/[id].delete.ts` (Delete)
- [ ] Add layer to `extends` in root `nuxt.config.ts` (if not auto-scanning)
- [ ] Test auto-imports work
- [ ] Add tests in `tests/`
- [ ] Update root `CLAUDE.md` with layer documentation

### When Debugging Imports

Issues with imports usually stem from:

1. Typo in file name or path
2. Incorrect layer directory structure
3. Not matching naming convention for components (PascalCase)
4. Missing `#shared` alias in layer config
5. Composable not in `app/composables/` directory

**Debug steps**:

1. Check file exists at expected path
2. Check folder structure matches convention
3. Run `npm run lint` to catch import errors
4. Check `nuxt.config.ts` for alias definition
5. Verify layer is in `~/layers/` (Nuxt 4 auto-scan)

---

## Common Patterns

### Pattern 1: Conditional Data Fetching

```typescript
// useExampleStore.ts
async function fetchIfNeeded() {
  if (items.value.length > 0) return
  await fetchAll()
}
```

### Pattern 2: Form with Validation

```typescript
// useExampleForm.ts
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

export function useExampleForm() {
  const { handleSubmit, values } = useForm({
    validationSchema: toTypedSchema(schema)
  })

  const onSubmit = handleSubmit(async values => {
    await useExampleApi().create(values)
  })

  return { handleSubmit: onSubmit, values }
}
```

### Pattern 3: Server Middleware

```typescript
// server/middleware/example-auth.ts
export default defineEventHandler(event => {
  const token = getCookie(event, 'auth')
  if (!token && event.node.req.url?.startsWith('/api/example/')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
})
```

### Pattern 4: Server Plugin

```typescript
// server/plugins/example.ts
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('request.before', event => {
    console.log(`[${event.node.req.method}] ${event.node.req.url}`)
  })
})
```

### Pattern 5: Global Store Initialization

```typescript
// shared/server/plugins/init-stores.ts
export default defineNitroPlugin(() => {
  // Subscribe to store changes on server
  const store = useExampleStore()
  // Initialize server-side data if needed
})
```

### Pattern 6: Environment-Based Configuration

```typescript
// In nuxt.config.ts or layer config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      environment: process.env.NODE_ENV,
      featureFlags: {
        newUI: process.env.FEATURE_NEW_UI === 'true'
      }
    }
  }
})

// In component
const config = useRuntimeConfig()
if (config.public.featureFlags.newUI) {
  // Use new UI
}
```

---

## Important Notes for AI Agents

### When Implementing This Pattern

1. **Always respect layer priority**: Lower numbers = foundation, higher numbers = features
2. **Never create root-level `app/`**: Everything goes in layers
3. **Composables are auto-imported**: No need to import in components (place in `app/composables/`)
4. **Components must match file name**: `ExampleCard.vue` → `<ExampleCard />`
5. **Use $fetch for events, useFetch for page loading**: Different data-fetching strategies
6. **Validate on server**: Never trust client-side validation alone
7. **Always type your data**: Use TypeScript interfaces in `types.ts`
8. **Follow naming convention**: Prefix components with feature name to avoid conflicts
9. **Test each layer independently**: Layers should be self-contained
10. **Document your layer**: Every layer should have `CLAUDE.md`

### When Migrating to This Pattern

1. Identify existing features/modules
2. Create layer for each feature (number them sequentially)
3. Move files maintaining structure inside layer
4. Update imports to use aliases if needed
5. Create simple API service + Pinia store for state management
6. Test each layer after migration
7. Update CI/CD to test by layer

---

## Quick Reference

| Concept       | Location                                        | Auto-Import        |
| ------------- | ----------------------------------------------- | ------------------ |
| Components    | `app/components/*.vue`                          | Yes (by filename)  |
| UI Components | `3rd-party or layers/shared/app/components/ui/` | Yes                |
| Composables   | `app/composables/*.ts`                          | Yes                |
| Pages         | `app/pages/**/*.vue`                            | Yes                |
| Layouts       | `app/layouts/*.vue`                             | Yes                |
| Middleware    | `app/middleware/*.ts`                           | Yes                |
| Plugins       | `app/plugins/*.ts`                              | Yes                |
| Utils         | `app/utils/*.ts`                                | No (manual import) |
| Types         | Via `#alias`                                    | Via alias          |
| API Routes    | `server/api/**/*.ts`                            | Yes (as endpoints) |

---

## References

- [Nuxt 4 Layers Official Docs](https://nuxt.com/docs/4.x/guide/going-further/layers)
- [Nuxt 4 Auto-Imports](https://nuxt.com/docs/guide/concepts/auto-imports)
- [Pinia with Nuxt](https://pinia.vuejs.org/ssr/nuxt.html)
- [shadcn-vue Components](https://www.shadcn-vue.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)

---

**Last Updated**: February 2026  
**Framework**: Nuxt 4  
**Original Project**: nuxt4-layers-template
