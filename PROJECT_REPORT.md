# Question Hive - Project Analysis & Improvement Report

## 1. Project Overview
**Question Hive** is a modern web application designed for creating and managing question papers. It leverages a monorepo structure to ensure scalability and code sharing.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime/Package Manager**: Bun
- **Monorepo Tool**: Turborepo
- **Database**: PostgreSQL (via Drizzle ORM)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Radix UI (via shadcn/ui)
- **AI Integration**: Vercel AI SDK (Streaming)

## 2. Architecture Analysis
The project follows a standard Turborepo monorepo structure:
- **apps/web**: The main Next.js application.
- **packages/db**: Shared database schema and client configuration.
- **packages/ui**: Shared UI components (though some UI components seem to reside in `apps/web/components/ui` as well).

### Database (Drizzle ORM)
- Schema defined in `packages/db/src/schema.ts`.
- Includes tables for `users`, `questions`, `papers`, `chapters`, `subjects`.
- Relations are well-defined using Drizzle's relational API.

### Authentication
- Implemented using Supabase Auth.
- Middleware in `apps/web/middleware.ts` handles session management and route protection.
- Google OAuth integration present (`apps/web/app/lib/google-auth.ts`).

## 3. Key Features & Implementation
- **Paper Designer**: A complex, interactive editor (`PaperDesigner.tsx`) allowing users to add questions, adjust settings, and preview papers.
  - **Drag & Drop**: Uses `@dnd-kit/core` for reordering questions.
  - **Live Preview**: Real-time rendering of the paper layout.
  - **Responsive Design**: Custom implementation for mobile/desktop views.
- **AI Question Generation**: Streaming support for generating questions based on prompts.
- **PDF Export**: Functionality to export papers as PDF.

## 4. Recent Improvements (Implemented)
- **Mobile Design Flow**: 
  - Framed a separate workflow for mobile users in the Paper Designer.
  - Users start in **Editor** mode (full width) to configure settings and add questions.
  - A dedicated bottom navigation bar allows switching to **Preview** mode.
  - Hidden redundant "Preview" header button on mobile to avoid confusion.
  - Optimized CSS for mobile to ensure 100% width usage and better padding.
- **Scroll Functionality**: Added vertical scrolling to the Editor Panel to handle content overflow.
- **Build Fixes**: Resolved import path errors in `profile/page.tsx`.

## 5. Code Quality & Assessment
- **Strengths**:
  - Modern stack usage (Next.js 15, Drizzle).
  - Type safety with TypeScript and Zod.
  - Clean UI with Tailwind.
- **Weaknesses**:
  - **Component Size**: `PaperDesigner.tsx` is extremely large (~2000 lines). It mixes state, UI, business logic, and drag-and-drop handlers.
  - **State Management**: Heavy reliance on local `useState` in `PaperDesigner.tsx` makes it hard to manage.
  - **Testing**: No visible unit or integration tests found in `apps/web` or `packages/db`.
  - **Hardcoded Values**: Some strings and configuration options are hardcoded within components.
  - **Accessibility**: Some custom UI elements (like the mobile toggle) might need ARIA labels.

## 6. Recommendations & Future Improvements

### A. Refactoring `PaperDesigner.tsx`
**Priority: High**
- **Action**: Break down the component into smaller sub-components:
  - `EditorPanel.tsx`: Handling the left side.
  - `PreviewPanel.tsx`: Handling the right side.
  - `SettingsForm.tsx`: The settings configuration form.
  - `QuestionList.tsx`: The drag-and-drop list.
- **Benefit**: Improves readability, maintainability, and performance.

### B. State Management
**Priority: Medium**
- **Action**: Adopt a state management library (like Zustand) or use React Context for the Paper Designer state.
- **Benefit**: Avoid prop drilling and make state updates more predictable.

### C. Testing Strategy
**Priority: High**
- **Action**: Initialize a testing environment (Vitest + React Testing Library).
- **Scope**:
  - Unit tests for utility functions in `lib/`.
  - Integration tests for `PaperDesigner` interactions.
  - API route tests.

### D. Error Handling
**Priority: Medium**
- **Action**: Implement React Error Boundaries around major components to prevent full app crashes.
- **Action**: Standardize API error responses.

### E. Mobile Experience
**Priority: Medium**
- **Action**: Further refine the mobile UI. Ensure all settings inputs are touch-friendly.
- **Action**: Consider a "Wizard" approach for mobile (Step 1: Settings, Step 2: Questions, Step 3: Preview) instead of tabs, if the flow becomes too complex.

### F. Performance Optimization
**Priority: Low**
- **Action**: Use `React.memo` for the `PaperSheet` component to avoid re-rendering the preview on every keystroke in the editor.
- **Action**: Optimize large lists using virtualization (if question lists grow large).

