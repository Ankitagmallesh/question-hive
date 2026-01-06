## Quick Start

1. Install dependencies (monorepo root):
  ```sh
  bun install
  ```
2. Choose database mode:
  - Local Docker Postgres: ensure Docker running, then `./start.sh` (auto creates container)
  - Supabase Postgres: create `.env.local` files (see below) and run servers individually (`bun run server` / `bun run web`) or still use `./start.sh` (it will skip Docker when `SUPABASE_URL`/`DATABASE_URL` points to Supabase).
3. Start development:
  ```sh
  ./start.sh
  ```

## Supabase + Drizzle Integration

This repo uses a shared package `@repo/db` (in `packages/db`) with Drizzle ORM and `postgres-js` to connect directly to Supabase Postgres.

Key files:
- `packages/db/src/schema.ts` – Drizzle schema mirroring core tables
- `packages/db/src/client.ts` – Drizzle client reading `SUPABASE_DB_CONNECT_URL` or `DATABASE_URL`
- `drizzle.config.ts` – configuration for generating migrations
- `apps/web/app/api/questions/route.ts` – Example API route using Drizzle

### Environment Variables

`apps/web/.env.local` (example):
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
SUPABASE_DB_CONNECT_URL=postgres://postgres:password@db.<project-ref>.supabase.co:5432/postgres
```

`apps/server/.env.local` (example):
```
DATABASE_URL=postgres://postgres:password@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
```

> Never commit real keys. The service role key stays server-side only.

### Generating & Applying Migrations

1. Make schema changes in `packages/db/src/schema.ts`.
2. Generate SQL migrations:
  ```sh
  bun run --filter=@repo/db generate
  ```
3. Apply migrations (push):
  ```sh
  bun run --filter=@repo/db migrate
  ```

### Using Drizzle in Next.js Route Handlers

Import from the shared package:
```ts
import { db, questions } from '@repo/db';
const data = await db.select().from(questions).limit(50);
```

### Go Backend with Supabase

The Go server (`apps/server`) still uses GORM. Point it to Supabase by setting `DATABASE_URL` with SSL (Supabase default) – example:
```
DATABASE_URL=postgres://postgres:password@db.<project-ref>.supabase.co:5432/postgres
```
GORM migrations will run against Supabase automatically.

### Local vs Supabase Behavior

`start.sh` detects Supabase via `SUPABASE_URL` or `DATABASE_URL` containing `supabase.co` and skips launching the local Docker Postgres container.

---

# Turborepo Tailwind CSS starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-tailwind
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `web`: another [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `ui`: a stub React component library with [Tailwind CSS](https://tailwindcss.com/) shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. The component `.tsx` files are consumed by the Next.js apps directly using `transpilePackages` in `next.config.ts`. This was chosen for several reasons:

- Make sharing one `tailwind.config.ts` to apps and packages as easy as possible.
- Make package compilation simple by only depending on the Next.js Compiler and `tailwindcss`.
- Ensure Tailwind classes do not overwrite each other. The `ui` package uses a `ui-` prefix for it's classes.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.ts` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example, in [tailwind.config.ts](packages/tailwind-config/tailwind.config.ts):

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This Turborepo has some additional tools already setup for you:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
