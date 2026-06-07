# Repository Guidelines

This file is the agent entry point for repository rules. For the full project documentation, start with [`docs/README.md`](docs/README.md).

Use the docs below as the source of truth for implementation details:

- [`docs/layers.md`](docs/layers.md): layer structure and architecture
- [`docs/ui-styles.md`](docs/ui-styles.md): UI conventions and design system rules
- [`docs/crud-table-pattern.md`](docs/crud-table-pattern.md): shared CRUD table contract
- [`docs/inline-crud-table-mechanism.md`](docs/inline-crud-table-mechanism.md): inline CRUD mechanics
- [`docs/product-requirement-design.md`](docs/product-requirement-design.md): product requirements and design notes
- [`docs/sprint-1.md`](docs/sprint-1.md), [`docs/sprint-2.md`](docs/sprint-2.md), [`docs/sprint-3.md`](docs/sprint-3.md): sprint history and delivery notes

Operational conventions for this repo:

- Keep feature-specific code inside its own layer. Promote code to `layers/shared` only when it is genuinely reusable.
- Use `pnpm` for package management and the scripts documented in `docs/README.md`.
- Keep edits scoped to the smallest relevant module or layer.
- Add or update tests when behavior changes.
- Do not commit secrets from `.env`.
- Keep database changes in Prisma migrations and treat seed data as local-development only.
- Follow Conventional Commits for commit messages.

When the docs and existing code disagree, treat the docs and local implementation as the reference, then confirm the effective behavior in code before changing it.
