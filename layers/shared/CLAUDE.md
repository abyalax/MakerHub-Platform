# Shared Layer - Foundation

**Status**: ✅ Foundation Layer  
**Priority**: 0 (Highest - loaded first)

## Overview

The `shared` layer is the **foundation layer** that provides:

- Global UI components (shadcn-vue)
- Global CSS and styling (Tailwind CSS)
- Shared utility functions
- Global layouts and providers
- Root application setup (app.vue)

## Architecture

```
layers/shared/
├── app/
│   ├── app.vue                  # Root component (required)
│   ├── assets/css/              # Global CSS
│   ├── components/
│   │   ├── ui/                  # shadcn-vue components
│   │   ├── fragments/           # Reusable fragment components
│   │   ├── layouts/             # Global layouts
│   │   └── providers/           # Context providers
│   ├── composable/              # Shared composables
│   ├── context/                 # Context utilities
│   ├── layouts/
│   │   ├── authenticated.vue
│   │   └── empty.vue
│   ├── lib/
│   │   ├── utils.ts            # Global utility functions
│   │   └── cookies.ts
│   ├── plugins/
│   │   └── ssr-width.ts
│   └── utils/
│       └── createContext.ts
├── server/
│   ├── api/                     # Global API routes
│   └── middleware/
└── nuxt.config.ts
```

## Key Files

### app.vue

- Root Vue component that wraps all pages
- Imports global CSS and Sonner styles
- Sets up NuxtLayout and NuxtPage

### Layouts

- `authenticated.vue` - For authenticated pages
- `empty.vue` - For public pages (login, etc.)

### Components

#### UI Components (`components/ui/`)

Auto-imported shadcn-vue components:

- Button, Badge, Card, Dialog, etc.
- Auto-available as `<Button />`, `<Badge />`, etc.

#### Fragments (`components/fragments/`)

Common UI fragments:

- Breadcrumbs
- Command palette
- Confirm dialog
- Input field
- Sidebar

#### Layouts (`components/layouts/`)

Layout building blocks:

- Flex.vue - Flexbox container
- Header.vue - App header
- Main.vue - Main content area
- Page.vue - Full page wrapper

#### Providers (`components/providers/`)

Context providers:

- AppProvider - Global app context
- DirectionProvider - RTL/LTR support
- LayoutProvider - Layout preferences
- SearchProvider - Global search

## Utilities

### `lib/utils.ts`

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Used for merging Tailwind classes.

### `lib/cookies.ts`

Cookie utility functions for SSR-safe cookie handling.

### `composable/`

Global composables:

- `useDialogState.ts` - Dialog state management
- `useTheme.ts` - Theme switching (light/dark/system)

### `context/`

Context-related utilities:

- `useAppSearch.ts` - Global search context
- `useDirection.ts` - Text direction context
- `useLayout.ts` - Layout preferences context

## Configuration

### nuxt.config.ts

- Sets up global CSS
- Defines shared type aliases
- Configures auto-imports

### CSS

- Tailwind CSS v4
- SVG icon support
- Animation support

## Plugins

### ssr-width.ts

Provides SSR-safe window width for responsive components.

## Database & Server Routes

**Note**: Server routes should be feature-specific and placed in each feature layer.

## Dependencies

- Vue 3.5+
- Nuxt 4.3+
- Tailwind CSS v4
- shadcn-vue
- @vueuse/core
- clsx & tailwind-merge (for class utilities)

## Auto-Imports

All files in `app/components/`, `app/composables/`, and `app/layouts/` are automatically imported.

### Components

```vue
<Button />
<!-- From ui/button/ -->
<Badge />
<!-- From ui/badge/ -->
<BreadCrumbs />
<!-- From fragments/breadcrumbs/ -->
```

### Composables

```typescript
const theme = useTheme()           <!-- Auto-imported -->
const dialogState = useDialogState()  <!-- Auto-imported -->
```

## Usage Guidelines

1. **Add global UI to `components/ui/`** - Use shadcn-vue or create custom
2. **Add reusable layouts to `components/layouts/`** - For page structure
3. **Add shared utilities to `lib/`** - For helper functions
4. **Use Tailwind CSS for styling** - Avoid inline styles
5. **Leverage context providers** - Pass data via providers instead of props drilling

## Testing

- Unit tests for utilities in `tests/unit/`
- Component tests for UI in `tests/nuxt/`

## Notes

- This is the **foundation layer** - all other layers depend on it
- Do not add feature-specific logic here
- Keep this layer lightweight and focused on shared functionality
- Auto-scan order: `shared` → `auth` → `users` → ...

---

**Last Updated**: February 2026  
**Nuxt Version**: 4.3+
\_Last Update at 2026-05-15 19:55:20\_
