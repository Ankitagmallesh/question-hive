# Project Issues & Technical Debt Report

## 1. Critical Bugs & Runtime Errors

### 1.1 PDF Generation Failure (Production/Vercel)
- **Location:** [`apps/web/app/api/export-pdf/route.ts`](apps/web/app/api/export-pdf/route.ts)
- **Issue:** The current implementation attempts to launch Puppeteer. In serverless environments (like Vercel), this often fails with "Could not find Chrome" because the browser binary is not included in the slug.
- **Status:** **Active**. Requires proper configuration of `puppeteer-core` + `@sparticuz/chromium` and ensuring the size limit is not exceeded.

### 1.2 Weak Database Linking in "Get Paper" API
- **Location:** [`apps/web/app/api/question-papers/[id]/route.ts`](apps/web/app/api/question-papers/[id]/route.ts)
- **Issue:** The query uses a weak `LEFT JOIN` between `questions` and `chapters` on `subjectId`:
  ```typescript
  .leftJoin(chapters, eq(questions.subjectId, chapters.subjectId))
  ```
  This causes a Cartesian product (many-to-many match) if a subject has multiple chapters, potentially crashing the API or returning incorrect data (e.g., `TypeError: Cannot convert undefined or null to object` when processing results).
- **Fix Required:** Link questions to chapters via a specific `topicId` or `chapterId` column, not just the broad `subjectId`.

### 1.3 Hardcoded Subject & User IDs
- **Location:** [`apps/web/app/api/question-papers/route.ts`](apps/web/app/api/question-papers/route.ts)
- **Issue:** 
  - `subjectId` is hardcoded to `1` (First subject found).
  - `userId` falls back to `1` or auto-generates a random numeric ID if the email isn't found.
  - **Code Reference:**
    ```typescript
    // TODO: Add Subject selection in Paper Designer
    const subjectRes = await db.select({ id: subjects.id }).from(subjects).limit(1);
    ```
- **Impact:** Papers are not correctly categorized by subject.

## 2. Architecture & Code Quality

### 2.1 Monolithic Component (`PaperDesigner.tsx`)
- **Location:** `apps/web/app/question-papers/create/PaperDesigner.tsx`
- **Issue:** The component is excessively large (~2000 lines), mixing:
  - Complex State Management (Context/Redux needed)
  - Drag-and-Drop Logic
  - UI Rendering (Editor vs Preview)
  - Business Logic (API calls)
- **Recommendation:** Refactor into smaller sub-components (`EditorPanel`, `PreviewPanel`, `SettingsForm`).

### 2.2 ID Generation Strategy
- **Location:** Multiple API Routes
- **Issue:** Usage of `Math.random()` for ID generation:
  ```typescript
  const newPaperId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);
  ```
- **Risk:** High probability of ID collisions in a production environment. Should use UUIDs or database auto-increment sequences.

### 2.3 Type Safety & Error Handling
- **Location:** Global
- **Issue:** 
  - Frequent use of `any` in `catch` blocks and data mapping.
  - Lack of Zod validation for API request bodies (e.g., `PaperData` interface is manually defined instead of inferred from a schema).

## 3. Database & Schema

### 3.1 Schema Definition
- **Location:** `packages/db/src/schema.ts`
- **Issue:** 
  - Potential mismatch between `questions` table relationships and actual query usage (as seen in the "Get Paper" issue).
  - `passwordHash` in `users` table allows nulls or requires placeholder values (`'supabase_auth'`) which indicates a drift between the Auth provider (Supabase) and local DB user tracking.

## 4. Testing & Reliability

### 4.1 Missing Test Suite
- **Location:** Global
- **Issue:** No unit or integration tests exist for critical flows:
  - Paper Generation Logic
  - API Endpoints
  - PDF Export
- **Risk:** High regression risk when refactoring or adding features.

## 5. UI/UX Improvements

### 5.1 Mobile Responsiveness
- **Issue:** While a mobile flow exists, complex interactions (Drag & Drop) are difficult on touch devices.
- **Recommendation:** Implement a simplified "Wizard" mode for mobile creation.

### 5.2 Accessibility
- **Issue:** Missing ARIA labels on custom interactive elements (toggles, custom dropdowns).
