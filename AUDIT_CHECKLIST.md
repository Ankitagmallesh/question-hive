# Question Hive - Audit Checklist & Action Items

## 📋 Issue Tracking

### CRITICAL ISSUES (Must Fix Before Production)

#### Issue #1: PDF Generation Failure
- **Status**: 🔴 CRITICAL
- **Location**: `apps/web/app/api/export-pdf/route.ts`
- **Problem**: Puppeteer crashes in Vercel (no Chrome binary)
- **Dependencies**: Add `@sparticuz/chromium`, `puppeteer-core`
- **Estimated Time**: 2-3 hours
- **Priority**: 🔥 HIGHEST
- **Assignee**: [Name]
- **Due Date**: [ASAP - within 2 days]

**Checklist**:
- [ ] Install @sparticuz/chromium
- [ ] Update browser launch configuration
- [ ] Test locally with `bun dev`
- [ ] Deploy to staging and test
- [ ] Verify file size under Vercel limits
- [ ] Add timeout and retry logic
- [ ] Update error messaging

**Evidence of Fix**:
- [ ] PDF export works in production
- [ ] Error logs show successful PDF generation
- [ ] File size < 500MB

---

#### Issue #2: Database Query Cartesian Product
- **Status**: 🔴 CRITICAL
- **Location**: `apps/web/app/server/db/queries/question-papers.ts` (getQuestionPaperById)
- **Problem**: JOIN on subjectId causes duplicated data
- **Requires**: Schema migration (add chapterId to questions)
- **Estimated Time**: 3-4 hours
- **Priority**: 🔥 HIGHEST
- **Assignee**: [Name]
- **Due Date**: [ASAP - within 2 days]

**Checklist**:
- [ ] Add `chapterId` field to questions table in schema
- [ ] Create Drizzle migration
- [ ] Update existing questions with chapter associations
- [ ] Fix the LEFT JOIN in getQuestionPaperById
- [ ] Test query returns correct data (no duplication)
- [ ] Verify with 10 sample papers

**Evidence of Fix**:
- [ ] Database migration applied
- [ ] Query returns exactly N questions (not N × chapters)
- [ ] No duplicate question data in responses

---

#### Issue #3: Hardcoded Subject/User IDs
- **Status**: 🔴 CRITICAL
- **Location**: `apps/web/app/api/question-papers/route.ts`
- **Problem**: All papers saved to subject ID 1; user ID fallback to 1
- **Requires**: UI changes + API logic fixes
- **Estimated Time**: 4-6 hours
- **Priority**: 🔥 HIGHEST
- **Assignee**: [Name]
- **Due Date**: [ASAP - within 3 days]

**Checklist**:
- [ ] Add subject selection dropdown to Paper Designer UI
- [ ] Update API to accept subjectId from request body
- [ ] Add validation: subjectId exists and user has access
- [ ] Remove hardcoded subject query (.limit(1))
- [ ] Remove user ID fallback to 1
- [ ] Add authorization check: user owns selected subject
- [ ] Test with multiple subjects

**Evidence of Fix**:
- [ ] Subject selection UI visible in Paper Designer
- [ ] Papers saved to correct subject
- [ ] Different users' papers don't mix

---

#### Issue #4: Weak ID Generation (Math.random)
- **Status**: 🔴 CRITICAL
- **Location**: Multiple API routes (questionPapers, questions, etc.)
- **Problem**: ID collision risk with Math.random()
- **Solution**: Use UUID or database auto-increment
- **Estimated Time**: 1-2 hours
- **Priority**: 🔥 HIGHEST
- **Assignee**: [Name]
- **Due Date**: [ASAP - within 2 days]

**Checklist**:
- [ ] Choose ID strategy: auto-increment (preferred) or UUID
- [ ] Update schema if using UUID
- [ ] Remove Math.random() ID generation code
- [ ] Test paper creation returns proper IDs
- [ ] Verify no collision in concurrent requests (load test)

**Evidence of Fix**:
- [ ] No Math.random() for ID generation in any route
- [ ] IDs are guaranteed unique
- [ ] Concurrent requests don't create duplicate IDs

---

### HIGH PRIORITY ISSUES

#### Issue #5: Missing Input Validation (Zod)
- **Status**: 🟠 HIGH
- **Locations**: All API routes in `apps/web/app/api/*`
- **Problem**: No request body validation
- **Solution**: Add Zod schemas + validation
- **Estimated Time**: 2-3 hours
- **Assignee**: [Name]
- **Due Date**: [Within 1 week]

**Files to Update**:
- [ ] Create `apps/web/app/lib/validation.ts` with Zod schemas
- [ ] `apps/web/app/api/question-papers/route.ts` - POST
- [ ] `apps/web/app/api/questions/create/route.ts` - POST
- [ ] `apps/web/app/api/generate-questions/route.ts` - POST
- [ ] `apps/web/app/api/profile/route.ts` - POST

**Evidence of Fix**:
- [ ] All API routes validate input with Zod
- [ ] Invalid requests return 400 with error details
- [ ] Type-safe request handling throughout

---

#### Issue #6: Email-Based Authentication in APIs
- **Status**: 🟠 HIGH
- **Locations**: `apps/web/app/api/*/route.ts`
- **Problem**: Using email from query params (can be spoofed)
- **Solution**: Use Supabase session/JWT token
- **Estimated Time**: 3-4 hours
- **Assignee**: [Name]
- **Due Date**: [Within 1 week]

**Files to Update**:
- [ ] `apps/web/app/api/question-papers/route.ts` - POST/GET
- [ ] `apps/web/app/api/question-papers/[id]/route.ts` - DELETE
- [ ] `apps/web/app/api/profile/route.ts` - GET/POST
- [ ] `apps/web/app/api/dashboard/stats/route.ts` - GET

**Pattern**:
```typescript
// Before (WRONG)
const email = searchParams.get('email');

// After (CORRECT)
const { data: session } = await supabase.auth.getSession();
const userId = session.user.id;
```

**Evidence of Fix**:
- [ ] No email extraction from query params
- [ ] All routes use Supabase session
- [ ] Unauthorized requests return 401

---

#### Issue #7: Missing Authorization Checks
- **Status**: 🟠 HIGH
- **Location**: All API mutation routes
- **Problem**: No ownership validation
- **Solution**: Verify user owns resource before delete/update
- **Estimated Time**: 2-3 hours
- **Assignee**: [Name]
- **Due Date**: [Within 1 week]

**Checklist**:
- [ ] DELETE /api/question-papers/[id] - verify ownership
- [ ] PUT /api/question-papers/[id] - verify ownership
- [ ] DELETE /api/questions/[id] - verify ownership
- [ ] Add authorization to middleware

**Pattern**:
```typescript
const paper = await db.select()
  .from(questionPapers)
  .where(and(
    eq(questionPapers.id, paperId),
    eq(questionPapers.createdBy, userId) // REQUIRED!
  ));

if (paper.length === 0) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

**Evidence of Fix**:
- [ ] Cannot delete papers owned by other users
- [ ] Cannot modify papers without authorization
- [ ] 403 returned on unauthorized attempts

---

#### Issue #8: PaperDesigner Component Monolith
- **Status**: 🟠 HIGH
- **Location**: `apps/web/app/question-papers/create/PaperDesigner.tsx`
- **Problem**: 2000+ lines, mixed concerns
- **Solution**: Refactor into smaller components
- **Estimated Time**: 1-2 weeks
- **Assignee**: [Name]
- **Due Date**: [Within 2 weeks]

**Refactoring Plan**:
- [ ] Create folder structure:
  ```
  question-papers/create/
  ├── PaperDesigner.tsx (container, ~300 lines)
  ├── EditorPanel.tsx (~200 lines)
  ├── PreviewPanel.tsx (~200 lines)
  ├── SettingsForm.tsx (~150 lines)
  ├── QuestionList.tsx (~200 lines)
  ├── hooks/
  │   ├── usePaperState.ts
  │   ├── useDragDrop.ts
  │   └── usePaperValidation.ts
  └── constants.ts
  ```
- [ ] Extract state to custom hook
- [ ] Extract drag-drop logic
- [ ] Extract settings form
- [ ] Extract question list
- [ ] Test all interactions still work
- [ ] Verify no performance regression

**Evidence of Fix**:
- [ ] No single file > 300 lines
- [ ] All tests pass
- [ ] Same functionality preserved

---

#### Issue #9: No Test Coverage
- **Status**: 🟠 HIGH
- **Scope**: Entire codebase
- **Problem**: 0% test coverage
- **Solution**: Add Vitest + @testing-library
- **Estimated Time**: 2-3 weeks
- **Assignee**: [Name]
- **Due Date**: [Within 3 weeks]

**Setup Checklist**:
- [ ] Install Vitest and dependencies
- [ ] Create `vitest.config.ts`
- [ ] Create `vitest.setup.ts`
- [ ] Add test scripts to package.json
- [ ] Create test directories

**Tests to Write** (Priority Order):
- [ ] API routes (critical):
  - [ ] `/api/question-papers` - create, list, delete
  - [ ] `/api/questions/metadata` - fetch all metadata
  - [ ] `/api/generate-questions` - AI generation
  - [ ] `/api/export-pdf` - PDF export
- [ ] Database queries:
  - [ ] getQuestionPaperById
  - [ ] getQuestions
  - [ ] saveQuestionPaper
- [ ] Components:
  - [ ] PaperDesigner integration
  - [ ] QuestionList drag-drop
  - [ ] SettingsForm validation
- [ ] Utilities:
  - [ ] Cache functions
  - [ ] Validation helpers

**Coverage Target**: > 80%

**Evidence of Fix**:
- [ ] `bun test` runs all tests
- [ ] Coverage report shows > 50% after first phase
- [ ] CI/CD runs tests on PR

---

#### Issue #10: TypeScript Build Errors Ignored
- **Status**: 🟠 HIGH
- **Location**: `apps/web/next.config.ts`
- **Problem**: `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`
- **Solution**: Enable strict type checking
- **Estimated Time**: 1-2 hours
- **Assignee**: [Name]
- **Due Date**: [Within 1 week]

**Checklist**:
- [ ] Remove `ignoreBuildErrors: true` from next.config.ts
- [ ] Remove `ignoreDuringBuilds: true` from next.config.ts
- [ ] Run `bun run typecheck` - identify all errors
- [ ] Fix type errors systematically
- [ ] Add pre-commit hook for type checking
- [ ] Add to CI/CD pipeline

**Evidence of Fix**:
- [ ] `bun run build` succeeds with no type errors
- [ ] `bun run typecheck` passes
- [ ] No `any` types except justified cases

---

### MEDIUM PRIORITY ISSUES

#### Issue #11: Inconsistent Error Handling
- **Status**: 🟡 MEDIUM
- **Estimated Time**: 4-6 hours
- **Assignee**: [Name]
- **Due Date**: [Within 2 weeks]

**Checklist**:
- [ ] Create `apps/web/app/lib/errors.ts`
- [ ] Create `apps/web/app/lib/api-handler.ts`
- [ ] Add React Error Boundary component
- [ ] Standardize all API error responses
- [ ] Add error monitoring (Sentry)

**Pattern to Implement**:
```typescript
// Global error wrapper
const handleApiError = (error) => {
  // Consistent format
  return apiError(error.message, error.statusCode);
};

// Usage
try {
  // ... operation
} catch (error) {
  return handleApiError(error);
}
```

---

#### Issue #12: Missing Security Headers
- **Status**: 🟡 MEDIUM
- **Estimated Time**: 2-3 hours
- **Assignee**: [Name]
- **Due Date**: [Within 2 weeks]

**Checklist**:
- [ ] Add middleware for security headers
- [ ] Content-Security-Policy
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security
- [ ] Rate limiting middleware

---

#### Issue #13: Database Schema Optimization
- **Status**: 🟡 MEDIUM
- **Estimated Time**: 3-4 hours
- **Assignee**: [Name]
- **Due Date**: [Within 3 weeks]

**Checklist**:
- [ ] Add indexes on foreign keys
- [ ] Add indexes on frequently queried columns
- [ ] Standardize soft-delete pattern
- [ ] Add constraint for data integrity
- [ ] Performance test complex queries

---

#### Issue #14: Accessibility Issues
- **Status**: 🟡 MEDIUM
- **Estimated Time**: 4-6 hours
- **Assignee**: [Name]
- **Due Date**: [Within 3 weeks]

**Checklist**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Fix color-only indicators
- [ ] Add proper focus management
- [ ] Test with screen reader
- [ ] Run WCAG audit

---

#### Issue #15: Environment Variable Security
- **Status**: 🟡 MEDIUM
- **Estimated Time**: 1-2 hours
- **Assignee**: [Name]
- **Due Date**: [Within 1 week]

**Checklist**:
- [ ] Move API keys from turbo.json globalPassThroughEnv
- [ ] Remove DATABASE_URL from global env
- [ ] Use .env.local (git-ignored)
- [ ] Document all required env vars
- [ ] Add validation for missing env vars

---

## 📊 Progress Tracking

### Week 1 (Critical Fixes)
```
Critical Issues Status:
├─ PDF Generation: [        ] 0% → 100%
├─ Query Bug: [        ] 0% → 100%
├─ Hardcoded IDs: [        ] 0% → 100%
└─ ID Generation: [        ] 0% → 100%

High Priority Issues Status:
├─ Input Validation: [        ] 0% → 100%
├─ Email Auth Fix: [        ] 0% → 100%
├─ Authorization: [        ] 0% → 100%
└─ TypeScript Fix: [        ] 0% → 100%
```

### Week 2-3 (High Priority Features)
```
├─ PaperDesigner Refactor: [        ] 0% → 100%
├─ Test Suite Setup: [        ] 0% → 50%
├─ Error Handling: [        ] 0% → 100%
└─ State Management: [        ] 0% → 100%
```

### Week 4+ (Medium Priority)
```
├─ Test Coverage > 80%: [        ] 0% → 100%
├─ Security Hardening: [        ] 0% → 100%
├─ Performance Optimization: [        ] 0% → 100%
└─ Accessibility: [        ] 0% → 100%
```

---

## 🎯 Definition of Done

For each issue to be marked complete:

- [ ] Code changes implemented
- [ ] All tests pass
- [ ] Code review approved
- [ ] Staged deployment successful
- [ ] Production deployment successful
- [ ] Monitoring shows no errors
- [ ] Documentation updated

---

## 📝 Sign-Off

**Audit Conducted By**: AI Code Auditor  
**Date**: January 26, 2026  
**Status**: Complete - 15 issues identified  
**Risk Level**: 🔴 **CRITICAL** (4 blocking issues)  

**Approval Required**: Yes  
**Go/No-Go Decision**: **NO-GO** until critical issues fixed  

**Approved By**: _________________  
**Date**: _________________  

---

## 📞 Support

For questions about any issue, refer to:
- **COMPREHENSIVE_AUDIT.md** - Detailed explanation
- **AUDIT_IMPLEMENTATION_GUIDE.md** - Code examples
- **EXECUTIVE_AUDIT_SUMMARY.md** - Quick reference

---

**Last Updated**: January 26, 2026  
**Next Review**: After critical issues fixed (approx. 1 week)
