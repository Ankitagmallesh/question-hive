# Question Hive - Technical Documentation

> **Note**: This documentation describes the *current state* of the codebase as of Jan 2026. It documents existing patterns, including inconsistent ones, without prescribing improvements.

---

## 1. PROJECT OVERVIEW

**Question Hive** is a SaaS-like platform designed for educational institutions to manage, generate, and export question papers. It allows users (likely teachers or administrators) to maintain a bank of questions, organize them by academic hierarchy (Exams > Subjects > Chapters), and assemble them into formatted question papers using a drag-and-drop interface.

### High-Level Components
1.  **Frontend (`apps/web`)**: A Next.js (React) web application providing the user interface for managing content, designing papers, and user authentication.
2.  **Backend (`apps/server`)**: A Go (Golang) REST API service built with Gin, responsible for business logic and potentially handling specific API requests, though some data access happens directly from the frontend.
3.  **Database**: A PostgreSQL database (hosted on Supabase) serving as the single source of truth for all data.
4.  **Shared Packages (`packages/*`)**: A set of internal packages for database implementation (`db`), API clients (`api`), UI components (`ui`), and shared types (`types`).

### Major Capabilities
- **Question Bank Management**: Create and store questions with options, difficulty levels, and marks.
- **Academic Structure**: Organize content by Exams, Subjects, and Chapters.
- **Paper Designer**: A specialized "Paper Designer" UI for creating exam papers via drag-and-drop, with real-time preview and formatting options (fonts, margins, templates).
- **PDF Generation**: (Inferred from UI) Capability to preview and likely print/export papers.
- **Authentication**: User identity management (appearing to use Supabase Auth).

### Limitations
- The system relies on a mix of direct-to-database (via Supabase client) and proxy-through-server (via Go API) patterns.

---

## 2. TECH STACK & DEPENDENCIES

### Core Technologies
- **Languages**: TypeScript (Frontend/Scripts), Go (Backend).
- **Monorepo Manager**: Turborepo.
- **Package Manager**: Bun (inferred from `bun.lock` and `package.json` scripts).

### Frontend
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS 4, standard CSS.
- **UI Libraries**: Radix UI (primitives), Lucide React (icons), `dnd-kit` (drag and drop).
- **State/Data**: React Hooks (`useState`, `useEffect`), Supabase Client (`@supabase/supabase-js`).
- **Build Tool**: Next.js Compiler (Turbopack).

### Backend
- **Language**: Go 1.23+.
- **Framework**: Gin Web Framework.
- **ORM/Data**: GORM (imported in `go.mod`), but Drizzle is used for schema management in `packages/db`.
- **Config**: Viper.
- **Auth**: `golang-jwt/jwt`.

### Database & Infrastructure
- **Database**: PostgreSQL (Supabase).
- **Schema Management**: Drizzle ORM (Kit & Core).
- **Authentication**: Supabase Auth (Frontend) / JWT (Backend).

---

## 3. REPOSITORY STRUCTURE

The project follows a standard Turborepo monorepo structure.

### Root Directory
- **`apps/`**: Application source code.
- **`packages/`**: Shared internal libraries.
- **`start.sh`**: Startup script.
- **`drizzle.config.ts`**: Database migration configuration.

### Backend Folder Tree (`apps/server`)
```text
apps/server/
├── config/           # Configuration loading (Viper, .env handling)
├── database/         # Database connection initialization
├── generate-questions/ # (Inferred) Logic for AI question generation
├── handlers/         # HTTP request handlers (Controllers)
├── middleware/       # Gin middleware (Auth, Logger, CORS)
├── models/           # Go struct definitions for DB models (GORM)
├── routes/           # API route definitions and grouping
├── utils/            # Shared utilities (JWT, etc.)
├── main.go           # Application Entry Point
└── go.mod            # Go module definitions
```

### Frontend Folder Tree (`apps/web`)
```text
apps/web/
├── app/                  # Next.js App Router directory
│   ├── analytics/        # Analytics pages
│   ├── api/              # (Likely) Next.js API generic routes
│   ├── auth/             # Authentication pages (Login/Signup)
│   ├── components/       # Local React components
│   ├── home/             # Landing/Home pages
│   ├── profile/          # User profile management
│   ├── question-papers/  # Paper management & creation
│   │   ├── create/       # "Paper Designer" UI logic
│   │   └── ...
│   ├── questions/        # Question bank management
│   ├── saved/            # Saved items/papers
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout (Providers, Fonts)
│   └── page.tsx          # Root entry page
├── components/           # (Possible) Shared app components
├── hooks/                # Custom React hooks (e.g., useSupabaseAuth)
├── lib/                  # Utilities (Supabase client init)
├── next.config.ts        # Next.js configuration
└── tailwind.config.ts    # Tailwind configuration
```

### Shared Packages (`packages/`)
- **`api`**: TypeScript API client (`ApiClient`), exporting methods to talk to the Go backend.
- **`db`**: Drizzle ORM schema definitions and migrations. **Single Source of Truth for DB Schema**.
- **`ui`**: Shared React UI components.
- **`types`**: Shared TypeScript interfaces/types (User, Question, etc.).
- **`utils`**: Shared utility functions.
- **`config`**: Shared configurations (eslint, typescript, tailwind).

---

## 4. BACKEND DOCUMENTATION (`apps/server`)

The backend is a Go application using the Gin framework. It currently runs alongside the Next.js frontend and shares the same PostgreSQL database.

**Entry Point**: `main.go`
- Loads environment variables (`.env.local`).
- Initializes configuration (`config` package).
- Connects to Database (`database` package).
- Sets up Gin Router and CORS.
- Registers Routes (`routes` package).
- Starts Server (default port 8080).

**Routing System** (`routes/routes.go`)
Routes are grouped into versioned APIs (`/api/v1`):
- **Public**: `/auth/register`, `/auth/login`, `/academic/*` (Exams, Subjects - noted as "public for now").
- **Protected** (via `middleware.AuthMiddleware`): `/user/profile`, `/questions/*`, `/question-papers/*`.

**Data Access Pattern**
- **Migration**: Handled externally by Drizzle (`packages/db`). The Go app does *not* run migrations.
- **Querying**: Uses GORM (Object Relational Mapper) to interact with the database.
- **Models**: Defined in `models/` (Go structs).

**Authentication**
- Uses generic JWT (JSON Web Tokens).
- `handlers.Login` issues a token.
- `middleware.AuthMiddleware` verifies the token in the `Authorization` header.

**Observations on Consistency**:
- While the Go backend has full Auth and Question endpoints, the Frontend *also* has logic to query Supabase directly. This backend may only be partially used by the current frontend.

---

## 5. FRONTEND DOCUMENTATION (`apps/web`)

The frontend is a Next.js 15 application using the App Router. It is client-heavy (extensive `use client` usage).

**Application Bootstrap** (`app/layout.tsx`)
- Wraps application in `LenisProvider` (smooth scrolling).
- Injects `Toaster` for notifications.
- Loads `Plus Jakarta Sans` font.

**State Management**
- **Local State**: Heavy use of `useState` within page components (e.g., `PaperDesignerPage`).
- **Persistence**: `localStorage` is used to persist "Work in Progress" drafts (`current_paper_draft`, `saved_papers`).
- **Global Auth**: managed via `useSupabaseAuth` hook.

**Data Access Patterns (Dual Mode)**
1.  **Direct Supabase Access**:
    - Featured heavily in `app/question-papers/create/page.tsx`.
    - Uses `getSupabase()` client.
    - Queries tables (`questions`, `chapters`) directly with filters and sorting fully client-side (or via Supabase query modifiers).
2.  **API Client**:
    - The project includes `@repo/api` which wraps calls to the Go Backend.
    - Usage is less prominent in the "Paper Designer" flow but likely exists for other features.

**Major Flows: Paper Designer** (`/question-papers/create`)
1.  **User Entry**: selects "Create Paper".
2.  **Initialization**: Fetches list of Chapters from Supabase (`chapters` table).
3.  **Interaction**:
    - User modifies settings (Title, Duration, Difficulty).
    - User drags questions from "Source List" (left) to "Paper" (right).
    - **Live Fetching**: Changing chapters triggers a fetch of questions (`supabase.from('questions')`).
    - **Drafting**: Changes auto-save to `localStorage`.
4.  **Completion**: User clicks "Save", which writes the paper definition to `localStorage` (and likely syncs to DB, though the analyzed code prioritized local save).
5.  **Preview**: Renders a print-ready view of the questions.

---

## 6. API DOCUMENTATION

The Go Backend exposes the following REST endpoints.

**Base URL**: `/api/v1`

### Authentication
- `POST /auth/register`: Create new user.
- `POST /auth/login`: Authenticate and receive JWT.
- `POST /auth/oauth/google`: Handle Google OAuth callback.

### Academic (Hierarchy)
- `GET /academic/exams`: List all exams.
- `GET /academic/exams/:id/subjects`: Get subjects for an exam.
- `GET /academic/subjects`: List all subjects.
- `GET /academic/subjects/:id/chapters`: Get chapters for a subject.
- `GET /academic/chapters`: List all chapters.

### Questions (Protected)
- `GET /questions`: List/Search questions.
- `POST /questions`: Create a new question.
- `GET /questions/:id`: Get specific question details.
- `PUT /questions/:id`: Update question.
- `DELETE /questions/:id`: Soft delete question.

### Question Papers (Protected)
- `GET /question-papers`: List papers.
- `POST /question-papers`: Create new paper metadata.
- `GET /question-papers/:id`: Get paper details.

---

## 7. DATABASE DOCUMENTATION

**Schema Source**: `packages/db/src/schema.ts` (Drizzle ORM).
**Database**: PostgreSQL.

### Core Tables

#### 1. Organizational / Lookup
- **`institutions`**: Schools/Colleges using the platform.
- **`difficulty_levels`**: Enum-like table (Easy, Medium, Hard).
- **`question_types`**: Enum-like table (MCQ, Subjective, etc.).
- **`users`**: Platform users (Teachers/Admins). Linked to `institutions` and `user_roles`.

#### 2. Academic Hierarchy
- **`exams`**: Top level (e.g., "Term End", "Board Exam").
- **`subjects`**: (e.g., "Physics", "Maths"). Linked to `exams`.
- **`chapters`**: (e.g., "Thermodynamics", "Calculus"). Linked to `subjects`.

#### 3. Question Bank
- **`questions`**: The core entity.
    - Fields: `content`, `marks`, `explanation`, `correct_answer`.
    - FKs: `subject_id`, `chapter_id`, `difficulty_level_id`, `question_type_id`.
- **`question_options`**: Distractors/Choices for MCQ questions. Linked to `questions`.

#### 4. Papers
- **`question_papers`**: Represents a created test paper.
    - Fields: `title`, `duration_minutes`, `total_marks`, `exam_date`.
- **`question_paper_items`**: Join table linking `question_papers` to `questions` with specific `order_index`.

---

## 8. CONFIGURATION & ENVIRONMENT

### Environment Variables (`.env` / `.env.local`)

| Variable | Service | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Shared | Connection string for PostgreSQL (Transaction mode) |
| `SUPABASE_DB_CONNECT_URL` | DB / Migrations | Direct connection string for schema migrations |
| `NEXT_PUBLIC_SUPABASE_URL`| Frontend | Supabase API URL for public client access |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase Anonymous Key for client access |
| `PORT` | Backend | Port for Go server (default: 8080) |
| `JWT_SECRET` | Backend | Key for signing/verifying generic JWTs |
| `GEMINI_API_KEY` | Backend | API Key for Google Gemini (AI generation) |

### Configuration Files
- **`turbo.json`**: Defines build pipeline and dependencies between apps.
- **`drizzle.config.ts`**: Configures Drizzle Kit for schema migrations.
- **`apps/server/config/config.go`**: Maps env vars to Go structs using `Viper`.

---

## 9. DEPLOYMENT & RUNNING LOCALLY

### Prerequisites
- Node.js & Bun (Package Manager)
- Go (1.23+)
- PostgreSQL Database (Supabase recommended)

### Local Development (Monorepo)
The project uses `go run` and `next dev` managed likely via `turbo` or individual terminals.

**1. Database Setup**
```bash
# In packages/db
bun run push # Push schema to DB
```

**2. Running Frontend**
```bash
cd apps/web
bun install
bun run dev
# Accessible at http://localhost:3000
```

**3. Running Backend**
```bash
cd apps/server
go run main.go
# Accessible at http://localhost:8080
```

---

## 10. KNOWN LIMITATIONS & TECH DEBT (OBSERVED)

1.  **Dual Auth Systems**: Frontend uses Supabase Auth helpers (`useSupabaseAuth`), while Backend has its own JWT implementation (`utils.InitJWT`, `handlers.Login`). It is unclear if they are synchronized (e.g., if the Go backend accepts Supabase tokens).
2.  **Inconsistent Data Access**: Frontend accesses database directly for Question retrieval in "Paper Designer", while an API Client exists for the Go backend. This splits business logic between Client (filtering/sorting questions) and Server.
3.  **Local Storage dependency**: The Paper Designer relies heavily on `localStorage` for "saving" drafts (`saved_papers`), which may not persist across devices.
4.  **Hardcoded Styling**: Some layout properties (width percentages, colors) are hardcoded in component logic rather than just CSS classes.
5.  **Dnd-Kit Sensors**: Explicit pointer/keyboard sensor configuration in `PaperDesignerPage` indicates likely workarounds for touch/input issues.

---

## 11. GLOSSARY

- **Institution**: The tenant or school using the system.
- **Paper Designer**: The specific UI module for dragging and dropping questions onto a sheet.
- **Chapter Weightage**: concept (seen in DB) for assigning importance to chapters, though usage in UI was not fully explored.
- **Drizzle**: The ORM used for schema definition, distinct from GORM used in the backend for querying.


