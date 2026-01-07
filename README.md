# Question Hive

A comprehensive question paper generation platform for educational institutions.

## Quick Start

1. **Install dependencies** (monorepo root):
   ```sh
   bun install
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env.local` in `apps/web`.
   - Configure your Supabase credentials.

3. **Start Development**:
   ```sh
   bun run dev
   ```
   This starts the Next.js application at `http://localhost:3000`.

## Architecture

This project is a **Next.js Monorepo** (Turborepo) using a unified architecture:

- **Frontend & API**: Next.js 15 (App Router) in `apps/web`.
- **Database**: PostgreSQL (Supabase) accessed via Drizzle ORM.
- **Shared Packages**:
  - `packages/db`: Single source of truth for Database Schema.
  - `packages/ui`: Shared UI components.

## Database & Migrations

We use **Drizzle ORM** for type-safe database access.

**Key files:**
- `packages/db/src/schema.ts` – Database Schema definition.
- `apps/web/app/api/...` – API Routes handling data logic.

**Running Migrations:**
1. Make changes to `packages/db/src/schema.ts`.
2. Generate migration files:
   ```sh
   bun run --filter=@repo/db generate
   ```
3. Apply to Supabase:
   ```sh
   bun run --filter=@repo/db migrate
   ```

## Development

The project is structured as follows:

- `apps/web`: The main application (Next.js).
- `packages/`: Shared logic and config.

To build the project:
```sh
bun run build
```
