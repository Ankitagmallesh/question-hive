# Question Hive - Audit Implementation Guide
**Companion to COMPREHENSIVE_AUDIT.md**

---

## Quick Reference: Critical Fixes

### 1. PDF Generation Fix

**File**: `apps/web/app/api/export-pdf/route.ts`

```bash
# Step 1: Install dependencies
bun add @sparticuz/chromium puppeteer-core
```

**Step 2: Update imports**
```typescript
// Before
import puppeteer from 'puppeteer';

// After
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
```

**Step 3: Update browser launch**
```typescript
// Before
const browser = await puppeteer.launch();

// After
let browser;
try {
  browser = await puppeteer.launch({
    args: [...chromium.args, '--disable-gpu'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  
  // Generate PDF (existing code)
  const page = await browser.newPage();
  // ... rest of PDF generation
} finally {
  if (browser) await browser.close();
}
```

**Vercel Requirements**:
- Keep binary size < 500MB (check with `bun add -d @vercel/nft`)
- Set 120-second timeout
- Use environment variables for configuration

---

### 2. Database Query Fix

**File**: `apps/web/app/server/db/queries/question-papers.ts`

**Phase 1: Update Schema**

```typescript
// packages/db/src/schema.ts

export const questions = pgTable('questions', {
  // ... existing fields ...
  
  // ADD NEW FIELD
  chapterId: bigint('chapter_id', { mode: 'number' })
    .notNull()
    .references(() => chapters.id),
  
  // Rename old field or mark deprecated
  subjectId: bigint('subject_id', { mode: 'number' })
    .notNull()
    .references(() => subjects.id),
}, (t) => ({
  // ADD NEW INDEX
  questionsChapterIdIndex: index('questions_chapter_id_idx').on(t.chapterId),
}));
```

**Create Migration**:
```bash
# Generate migration
bun run drizzle-kit generate --config=drizzle.config.ts --name=add_chapter_to_questions
```

**Phase 2: Fix Query**

```typescript
// Before (WRONG)
export const getQuestionPaperById = async (paperId: number) => {
  const paperRes = await db.select()
    .from(questionPapers)
    .where(eq(questionPapers.id, paperId));
    
  // ... broken join
  .leftJoin(chapters, eq(questions.subjectId, chapters.subjectId))
};

// After (CORRECT)
export const getQuestionPaperById = async (paperId: number) => {
  const paperRes = await db.select()
    .from(questionPapers)
    .where(eq(questionPapers.id, paperId));
  
  const itemsRes = await db.select({
    item: questionPaperItems,
    question: questions,
    chapter: chapters,
    difficulty: difficultyLevels,
    type: questionTypes,
    options: questionOptions,
  })
    .from(questionPaperItems)
    .innerJoin(questions, eq(questionPaperItems.questionId, questions.id))
    .innerJoin(chapters, eq(questions.chapterId, chapters.id))
    .innerJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
    .innerJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
    .leftJoin(questionOptions, eq(questions.id, questionOptions.questionId))
    .where(eq(questionPaperItems.questionPaperId, paperId));
  
  // Now items are properly grouped by question, not duplicated
  return mapToResult(paperRes[0], itemsRes);
};
```

---

### 3. Hardcoded ID Removal

**File**: `apps/web/app/api/question-papers/route.ts`

**Current Code** (WRONG):
```typescript
export async function POST(req: Request) {
  const body = await req.json();
  
  // WRONG: Always selects first subject
  const subjectRes = await db.select({ id: subjects.id })
    .from(subjects)
    .limit(1);
  const subjectId = subjectRes[0]?.id || 1;
  
  // WRONG: Fallback to user ID 1
  const userRes = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);
  const userId = userRes[0]?.id || 1;
  
  const paperId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);
  
  const paper = await db.insert(questionPapers).values({
    id: paperId,
    title: body.title,
    subjectId, // WRONG!
    createdBy: userId, // WRONG fallback!
  });
}
```

**Fixed Code**:
```typescript
import { v4 as uuidv4 } from 'uuid';

const SavePaperSchema = z.object({
  title: z.string().min(1).max(200),
  subjectId: z.number().positive(), // REQUIRED from client
  examId: z.number().positive(), // For validation
});

export async function POST(req: Request) {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = SavePaperSchema.parse(await req.json());
  
  // Verify user owns subject
  const subjectRes = await db.select({ id: subjects.id })
    .from(subjects)
    .where(and(
      eq(subjects.id, body.subjectId),
      eq(subjects.examId, body.examId),
    ));
  
  if (subjectRes.length === 0) {
    return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
  }
  
  // Get actual user from DB
  const userRes = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email));
  
  if (userRes.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  const userId = userRes[0]!.id;
  
  // Use auto-increment ID
  const paper = await db.insert(questionPapers).values({
    title: body.title,
    subjectId: body.subjectId,
    createdBy: userId,
    // id auto-generated by database!
  }).returning({ id: questionPapers.id });
  
  return NextResponse.json({
    success: true,
    paperId: paper[0]!.id,
  });
}
```

---

### 4. ID Generation Fix

**Pattern 1: Use Database Auto-Increment (RECOMMENDED)**

```typescript
// Schema (Drizzle)
export const questionPapers = pgTable('question_papers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(), // Auto-increment!
  // ... other fields
});

// Insert without specifying ID
const result = await db.insert(questionPapers)
  .values({ title: 'My Paper' })
  .returning({ id: questionPapers.id });

const paperId = result[0]!.id; // Guaranteed unique
```

**Pattern 2: Use UUIDs (if needed)**

```bash
bun add uuid
bun add -d @types/uuid
```

```typescript
import { v4 as uuidv4 } from 'uuid';

export const questionPapers = pgTable('question_papers', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  // ... other fields
});

// Or in code:
const paperId = uuidv4();
const result = await db.insert(questionPapers)
  .values({ id: paperId, title: 'My Paper' });
```

**Pattern 3: Snowflake IDs (for scale)**

```bash
bun add snowflake-id
```

```typescript
import Snowflake from 'snowflake-id';

const snowflake = new Snowflake({
  workerId: process.env.WORKER_ID || 1,
  datacenterId: process.env.DATACENTER_ID || 1,
});

const paperId = snowflake.generate();
```

---

## Error Handling Implementation

### Global Error Handler

**File**: `apps/web/app/lib/errors.ts` (NEW)

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public isPublic: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR', true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}
```

**File**: `apps/web/app/lib/api-handler.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { AppError } from './errors';

export const handleApiError = (error: unknown) => {
  console.error('[API Error]', error);
  
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.isPublic ? error.message : 'Internal server error',
        code: error.code,
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
};

export const apiResponse = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });
```

**Usage in Routes**:

```typescript
// apps/web/app/api/question-papers/[id]/route.ts
import { handleApiError, apiResponse } from '../../../lib/api-handler';
import { NotFoundError, UnauthorizedError } from '../../../lib/errors';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session) throw new UnauthorizedError();
    
    const paperId = parseInt((await params).id);
    if (isNaN(paperId)) throw new ValidationError('Invalid paper ID');
    
    // Check ownership
    const paper = await db.select()
      .from(questionPapers)
      .where(and(
        eq(questionPapers.id, paperId),
        eq(questionPapers.createdBy, userId)
      ));
    
    if (paper.length === 0) {
      throw new NotFoundError('Question paper');
    }
    
    await db.delete(questionPapers).where(eq(questionPapers.id, paperId));
    
    return apiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Zod Validation Setup

**File**: `apps/web/app/lib/validation.ts` (NEW)

```typescript
import { z } from 'zod';

// Reusable schemas
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const PositiveIntSchema = z.number().positive().int();

// API request schemas
export const SavePaperSchema = z.object({
  title: z.string().min(1).max(200),
  subjectId: PositiveIntSchema,
  examId: PositiveIntSchema,
  questions: z.array(z.object({
    id: PositiveIntSchema,
    marks: z.number().positive(),
  })),
  settings: z.record(z.any()).optional(),
});

export const CreateQuestionSchema = z.object({
  content: z.string().min(10),
  chapterId: PositiveIntSchema,
  difficultyLevelId: PositiveIntSchema,
  questionTypeId: PositiveIntSchema,
  marks: z.number().positive(),
  options: z.array(z.string()).optional(),
});

export type SavePaperInput = z.infer<typeof SavePaperSchema>;
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
```

**Usage**:

```typescript
import { SavePaperSchema } from '../lib/validation';

export async function POST(req: Request) {
  try {
    const body = SavePaperSchema.parse(await req.json());
    // body is now fully typed and validated
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    // ...
  }
}
```

---

## Testing Setup

**Installation**:
```bash
bun add -d vitest @vitest/ui @testing-library/react @testing-library/jest-dom @vitest/coverage-v8
bun add -d @types/node @types/bun
```

**File**: `vitest.config.ts` (NEW)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/**/*.test.{ts,tsx}',
        'app/**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
});
```

**File**: `vitest.setup.ts` (NEW)

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
  }),
}));

vi.mock('next/image', () => ({
  default: () => null,
}));
```

**Example Test**: `app/api/question-papers/__tests__/route.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('GET /api/question-papers', () => {
  it('should return papers for authenticated user', async () => {
    // Mock session
    const mockSession = {
      user: { id: 1, email: 'test@example.com' },
    };
    
    // Mock database
    const mockPapers = [
      { id: 1, title: 'Paper 1', updatedAt: new Date() },
    ];
    
    // Test
    const response = await fetch('/api/question-papers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

---

## React Error Boundary Setup

**File**: `components/ErrorBoundary.tsx` (NEW)

```typescript
'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
    // Send to error tracking service
    // Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-300 bg-red-50 rounded">
            <h2 className="font-bold text-red-900">Something went wrong</h2>
            <p className="text-red-800 text-sm mt-2">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**Usage**:

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ErrorBoundary fallback={<div>App Error</div>}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## State Management Setup (Zustand)

**Installation**:
```bash
bun add zustand immer
```

**File**: `app/store/paperStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Question {
  id: number;
  content: string;
  marks: number;
  difficulty: string;
}

interface PaperState {
  title: string;
  subjectId: number;
  questions: Question[];
  settings: Record<string, any>;
  
  // Actions
  setTitle: (title: string) => void;
  setSubjectId: (id: number) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (id: number) => void;
  reorderQuestions: (from: number, to: number) => void;
  updateSettings: (settings: Partial<PaperState['settings']>) => void;
  reset: () => void;
}

const initialState = {
  title: '',
  subjectId: 0,
  questions: [],
  settings: {},
};

export const usePaperStore = create<PaperState>()(
  immer((set) => ({
    ...initialState,

    setTitle: (title) =>
      set((state) => {
        state.title = title;
      }),

    setSubjectId: (id) =>
      set((state) => {
        state.subjectId = id;
      }),

    addQuestion: (question) =>
      set((state) => {
        state.questions.push(question);
      }),

    removeQuestion: (id) =>
      set((state) => {
        state.questions = state.questions.filter((q) => q.id !== id);
      }),

    reorderQuestions: (from, to) =>
      set((state) => {
        const [question] = state.questions.splice(from, 1);
        state.questions.splice(to, 0, question);
      }),

    updateSettings: (settings) =>
      set((state) => {
        state.settings = { ...state.settings, ...settings };
      }),

    reset: () => set(initialState),
  }))
);
```

---

## Performance Optimization

### Component Memoization

```typescript
// Before: Re-renders on every parent render
export function PaperPreview({ paper }) {
  return <div>{/* render paper */}</div>;
}

// After: Only re-renders if paper changes
import { memo } from 'react';

export const PaperPreview = memo(({ paper }) => {
  return <div>{/* render paper */}</div>;
}, (prev, next) => prev.paper.id === next.paper.id);
```

### Virtualized Lists

```bash
bun add @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function QuestionList({ questions }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-y-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <QuestionItem
            key={virtualItem.key}
            question={questions[virtualItem.index]}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Summary

Complete these implementations in order:

1. **Critical (Week 1)**:
   - [ ] PDF generation fix
   - [ ] Query Cartesian product fix
   - [ ] Remove hardcoded IDs
   - [ ] UUID ID generation

2. **High (Week 2)**:
   - [ ] Zod validation
   - [ ] Error handling
   - [ ] React Error Boundary
   - [ ] Authorization checks

3. **Medium (Week 3)**:
   - [ ] State management
   - [ ] Testing setup
   - [ ] Performance optimization
   - [ ] Accessibility fixes

---

**For questions or implementation help, refer back to COMPREHENSIVE_AUDIT.md**
