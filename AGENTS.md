# Repository Guidelines

## Project Structure & Module Organization

This is a Nuxt 4 layered application. Main code lives under `layers/`:

- `layers/shared/`: shared UI, layouts, composables, plugins, utilities, server abstractions, and global CSS.
- `layers/auth/`: authentication pages, middleware, plugins, composables, and components.
- `layers/users/`: user UI plus server API, services, repositories, and validators.
- `prisma/`: Prisma schema, migrations, and seed scripts.
- `public/`: static assets served as-is.
- `test/unit`, `test/nuxt`, and `test/e2e`: unit, Nuxt integration, and Playwright tests.

Keep feature-specific code inside its layer. Promote code to `layers/shared` only when it is genuinely reusable.

## Build, Test, and Development Commands

Use `pnpm` for all package operations.

- `pnpm dev`: start the Nuxt dev server.
- `pnpm build`: build the production application.
- `pnpm generate`: generate static output where supported.
- `pnpm preview`: preview a production build locally.
- `pnpm lint` / `pnpm lint:fix`: run ESLint, optionally applying fixes.
- `pnpm test` / `pnpm test:run`: run Vitest in watch or single-run mode.
- `pnpm test:coverage`: run Vitest with coverage output.
- `pnpm test:e2e`: run Playwright; it starts `pnpm run dev` automatically.
- `pnpm seed`: run Prisma database seeding.

## Coding Style & Naming Conventions

Prettier uses 2 spaces, single quotes, ES5 trailing commas, and a 150 character print width. ESLint uses Nuxt rules, warns on most `console` calls, enforces Vue self-closing style, and forbids prop mutation.

Use PascalCase for Vue components (`LoginForm.vue`), camelCase for composables (`useLogin.ts`), and kebab-case for URL-facing names. Prefer typed TypeScript APIs and Zod/Vee Validate schemas for validation.

## Testing Guidelines

Vitest is configured for `test/unit/*.test.ts` in Node and `test/nuxt/*.test.ts` in the Nuxt environment. Playwright tests live in `test/e2e/*.test.ts`. Name tests after the unit or feature, for example `users-service.test.ts` or `users-crud.integration.test.ts`.

Add or update tests for behavior changes. Run `pnpm test:run` for unit/integration changes and `pnpm test:e2e` for user-flow changes.

## Commit & Pull Request Guidelines

Commits use Conventional Commits enforced by Commitlint: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`, `ci:`, `build:`, or `revert:`. Subjects must be lower-case and at most 90 characters, for example `feat: add user import flow`.

Pull requests should include a clear description, change type, test steps, and confirmation that linting and tests pass. Link issues and include screenshots for UI changes.

## Security & Configuration

Do not commit secrets from `.env`. Keep database changes in Prisma migrations and verify seed data is safe for local development only.
