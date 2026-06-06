# Documentation

This directory contains project notes for the Nuxt 4 event management front-end.

## Start Here

- `layers.md`: architecture reference for the Nuxt layer layout.
- `ui-styles.md`: UI style guide, design tokens, component conventions, and theme behavior.
- `inline-crud-table-mechanism.md`: inline CRUD table pattern used by table-heavy feature pages.
- `crud-table-pattern.md`: current shared CRUD table contract and migration checklist.
- `users-module-reference.md`: concrete coding-style and implementation reference based on `layers/users`.

## Project Shape

Application code lives under `layers/`. The root `nuxt.config.ts` explicitly extends the active layers:

- `publics`
- `shared`
- `auth`
- `users`
- `users`
- `orders`

Folders such as `dashboard`, `qr-code`, and `unauthorized` are present but must be added to the root `extends` array before their pages are available.

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test:run
pnpm test:e2e
```

## Documentation Notes

- Prefer documenting current project behavior over starter-template behavior.
- Keep feature documentation near the feature when it is only useful for that feature.
- Keep shared conventions in this directory or in `AGENTS.md` when they help future coding sessions.
- New markdown should use ASCII punctuation to avoid the encoding issues visible in some older docs.

_Last Update at 2026-05-15 19:55:20_
