# Question Hive - Technical Documentation

> **Note**: This documentation describes the **Next.js Monolith** architecture responsible for the platform.

---

## 1. PROJECT OVERVIEW

**Question Hive** is a SaaS-like platform designed for educational institutions to manage, generate, and export question papers.

### High-Level Architecture
1.  **Unified App (`apps/web`)**: A Next.js 15 application that handles **both** the User Interface (React) and the Backend Logic (Route Handlers / Server Actions).
2.  **Database**: PostgreSQL (Supabase) managed via Drizzle ORM.
3.  **Shared Packages**: Internal libraries for database schema (`@repo/db`), UI (`@repo/ui`), and types.

---

## 2. TECH STACK

### Core
- **Framework**: Next.js 15 (App Router).
- **Language**: TypeScript (End-to-End).
- **Database**: PostgreSQL (Supabase).
- **ORM**: Drizzle ORM.
- **Auth**: NextAuth.js / Supabase Auth.
- **AI**: Google Gemini API (Integrated via Node.js API Routes).

### Frontend UI
- **Styling**: Tailwind CSS 4.
- **Components**: shadcn/ui, Radix UI.
- **Icons**: Lucide React.
- **Interactions**: `dnd-kit` (Drag & Drop), Framer Motion.

---

## 3. REPOSITORY STRUCTURE

The project is a **Turborepo** monorepo.

### Root Directory
- **`apps/`**: Contains the main application.
- **`packages/`**: Shared internal libraries.

### Application (`apps/web`)
```text
apps/web/
├── app/                  # Next.js App Router
│   ├── api/              # Backend API Routes (The "Backend")
│   │   ├── generate-questions/ # AI Logic
│   │   └── ...
│   ├── auth/             # Authentication Pages
│   ├── question-papers/  # Paper Designer & Management
│   └── questions/        # Question Bank
├── components/           # React Components
├── lib/                  # Utilities
└── public/               # Static Assets
```

### Shared Packages (`packages/`)
- **`db`**: **Single Source of Truth** for Database Schema (Drizzle).
- **`ui`**: Shared React components.
- **`types`**: Shared TypeScript definitions.
- **`config`**: ESLint, TypeScript, and Tailwind configurations.

---

## 4. DATA ACCESS & API

The application does not use a separate backend service. Instead, it uses **Next.js Route Handlers** and **Server Actions**.

### Database Access
All database interaction happens via **Drizzle ORM** (`@repo/db`).
- **Schema**: Defined in `packages/db/src/schema.ts`.
- **Client**: Instantiated in `packages/db/src/client.ts` and used in API routes.

### API Routes (`apps/web/app/api/*`)
- **`POST /api/generate-questions`**: Handles interactions with Google Gemini AI for generating questions from text/images.
- **`GET /api/exams`**: Fetches list of exams.
- **`GET /api/subjects`**: Fetches subjects filtered by exam.

---

## 5. AUTHENTICATION

Authentication is handled via **NextAuth.js** (or Supabase Auth directly in client components).
- **User Identity**: Stored in `users` table in Postgres.
- **Session**: Managed via JWTs or Supabase Sessions.

---

## 6. DATABASE SCHEMA

**Source**: `packages/db/src/schema.ts`

### Core Tables
- **`institutions`**: Tenant/School management.
- **`users`**: Teachers and Administrators.
- **`questions`**: The central question bank entity.
- **`question_papers`**: Definitions of generated papers.
- **`exams`, `subjects`, `chapters`**: Academic hierarchy metadata.

---

## 7. DEPLOYMENT

The entire application is deployed as a single **Next.js** unit.

- **Platform**: Vercel (recommended) or any Node.js host.
- **Build Command**: `bun run build`.
- **Start Command**: `bun run start`.
- **Environment**: Requires `DATABASE_URL` and `GEMINI_API_KEY`.
