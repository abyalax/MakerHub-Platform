# UI Styles

This project uses Tailwind CSS v4, shadcn-vue, reka-ui primitives, lucide icons, and CSS variables for theme tokens. The active global stylesheet is `layers/shared/app/assets/css/tailwind.css`.

## Component System

- shadcn-vue is configured in `components.json`.
- Style preset: `new-york`.
- Base color: `neutral`.
- Icons: `lucide`.
- Shared UI components live in `layers/shared/app/components/ui`.
- Reusable app fragments live in `layers/shared/app/components/fragments`.
- Layout building blocks live in `layers/shared/app/components/layouts`.

Use existing shared components before adding new primitives. If a new primitive is reusable across features, place it in `layers/shared/app/components/ui` or `layers/shared/app/components/fragments`. If it is feature-specific, keep it inside the feature layer.

## Theme Tokens

The CSS variables are defined for light mode under `:root` and dark mode under `.dark`.

Core semantic tokens:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`
- `--border`, `--input`, `--ring`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`
- `--chart-1` through `--chart-5`
- `--descriptions`, `--descriptions-foreground`

Tailwind exposes these through the `@theme inline` block, so prefer semantic utilities such as:

```html
<div class="bg-background text-foreground border-border">
  <button class="bg-primary text-primary-foreground">Save</button>
</div>
```

## Radius And Typography

The base radius token is:

```css
--radius: 0.625rem;
```

Derived Tailwind radius tokens are:

- `rounded-sm`: `calc(var(--radius) - 4px)`
- `rounded-md`: `calc(var(--radius) - 2px)`
- `rounded-lg`: `var(--radius)`
- `rounded-xl`: `calc(var(--radius) + 4px)`

Font tokens are registered for:

- `font-inter`
- `font-manrope`

Use existing typography components under `layers/shared/app/components/ui/typography` when a page already follows that pattern.

## Layout Pattern

Authenticated pages should generally use the shared page shell:

- `Page`
- `Header`
- `Main`
- `Flex`
- sidebar fragments
- `AppProvider`
- `ToggleTheme`
- `ConfigDrawer`

The `Page` component expects a `title` and `breadcrumbs`, exposes a `top-actions` slot, and renders page content through the `children` slot.

## Styling Rules

- Use Tailwind classes and semantic tokens instead of hard-coded colors when possible.
- Use `cn()` from `layers/shared/app/lib/utils.ts` for conditional class composition.
- Keep table, dialog, form, and sidebar styling consistent with existing shared components.
- Use lucide icons or existing icon components for actions.
- Do not duplicate shared primitives inside feature layers.
- Keep feature-specific styles in the feature component unless they become reusable.

## Built-In Global Utilities

The global stylesheet includes:

- `container`: centered block with horizontal padding.
- `no-scrollbar`: hides scrollbars across browsers.
- `faded-bottom`: adds a bottom fade overlay on medium screens and above.
- `.CollapsibleContent` animations for open/closed collapsibles.

Base rules also:

- set body background and foreground from semantic tokens,
- keep horizontal overflow hidden,
- make enabled buttons and button roles show a pointer cursor,
- avoid mobile input focus zoom by forcing inputs/selects/textareas to 16px below 768px.

## Dark Mode

Nuxt color mode is configured in `nuxt.config.ts`:

- default preference: `system`
- fallback: `light`
- storage: cookie
- storage key: `nuxt-color-mode`
- class suffix/prefix: empty, so dark mode is applied via `.dark`

Use `useTheme()` and the shared theme controls rather than directly mutating color mode in feature code.

## Tables

Shared table logic and documentation live under:

- `layers/shared/app/components/fragments/table`
- `layers/shared/app/composable/table`
- `docs/inline-crud-table-mechanism.md`

Feature layers can define columns and feature-specific table state, but should reuse the shared table primitives and filter/state composables.
_Last Update at 2026-05-15 19:55:20_
