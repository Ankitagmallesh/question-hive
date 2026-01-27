# Deployment Checklist - Critical Fixes

**Project**: Question Hive  
**Date**: January 27, 2026  
**Fixes Applied**: 4 Critical Issues + 2 Enhancement Packages

---

## Pre-Deployment Verification

### Code Quality
- [x] All TypeScript errors resolved
- [x] No compilation errors
- [x] All imports present and correct
- [x] Code follows project conventions

### Files Changed Summary
```
Modified Files: 6
├── apps/web/app/api/export-pdf/route.ts ✅
├── apps/web/app/api/question-papers/route.ts ✅
├── apps/web/app/api/questions/route.ts ✅
├── apps/web/app/server/db/mutations/question-papers.ts ✅
└── packages/db/src/schema.ts ✅

New Files: 5
├── apps/web/lib/validators.ts ✅
├── apps/web/lib/error-handler.ts ✅
├── apps/web/components/ErrorBoundary.tsx ✅
├── packages/db/migrations/0004_convert_questions_to_bigserial.sql ✅
└── CRITICAL_FIXES_SUMMARY.md ✅

Documentation: 1
└── This file

Total Changes: 12 files
```

### Dependencies Installed
```
✅ @sparticuz/chromium@143.0.4
✅ puppeteer-core@24.36.0
✅ zod@4.3.5 (already present)
```

---

## Fix Implementation Status

### Fix #1: PDF Export - Serverless Compatibility ✅
**Status**: COMPLETE
- [x] Installed @sparticuz/chromium and puppeteer-core
- [x] Updated browser launch logic with fallbacks
- [x] Added timeout configuration (120s)
- [x] Improved error messages and status codes
- [x] Email validation in POST handler

### Fix #2: Database Cartesian Product ✅
**Status**: VERIFIED (Already Fixed)
- [x] Confirmed code uses correct `chapterId` join
- [x] No Cartesian product issues detected

### Fix #3: Hardcoded Subject IDs ✅
**Status**: COMPLETE
- [x] Updated SavePaperInput to require subjectId
- [x] Removed hardcoded subjectId || 1 fallback
- [x] Removed hardcoded userId || 1 fallback
- [x] Added proper error handling for missing fields
- [x] Added Zod validation

### Fix #4: Insecure ID Generation ✅
**Status**: COMPLETE
- [x] Converted questions table to bigserial
- [x] Converted questionOptions table to bigserial
- [x] Updated mutation logic for auto-increment
- [x] Created database migration script
- [x] Removed Math.random() ID generation

### Enhancement #1: Input Validation ✅
**Status**: COMPLETE
- [x] Created comprehensive Zod schemas
- [x] Validated SavePaperInput
- [x] Validated ExportPdfRequest
- [x] Validated FetchQuestionsInput
- [x] Integrated into API routes

### Enhancement #2: Error Handling ✅
**Status**: COMPLETE
- [x] Created AppError class
- [x] Created AppErrors utility with predefined types
- [x] Implemented handleApiError() function
- [x] Created React ErrorBoundary component
- [x] Integrated into API routes

---

## Testing Completed

### Local Testing
- [x] TypeScript compilation (all errors fixed)
- [x] No runtime type issues
- [x] Validators test with sample data
- [x] Error handler formats responses correctly

### Manual Testing Required (In Staging)
- [ ] PDF export generates valid PDF
- [ ] Paper save with correct subject ID
- [ ] Error messages are user-friendly
- [ ] No database connection errors
- [ ] Concurrent request handling

### Regression Testing Required
- [ ] Existing papers load correctly
- [ ] Question search functionality
- [ ] Paper deletion works
- [ ] Authentication still works
- [ ] Credit deduction logic

---

## Database Migration Plan

### Pre-Migration
1. [ ] Take full database backup
2. [ ] Document current ID ranges
3. [ ] Test migration script in dev environment
4. [ ] Schedule maintenance window

### Migration Execution
```bash
# 1. Put app in maintenance mode (read-only)
# 2. Run migration
drizzle-kit migrate
# 3. Verify migration success
# 4. Enable write operations
```

### Post-Migration Verification
- [ ] Check no data was lost
- [ ] Verify new sequence values
- [ ] Test ID generation for new questions
- [ ] Confirm no orphaned records

### Rollback Plan
If migration fails:
1. Restore from backup
2. Revert code changes
3. Deploy previous version
4. Investigate root cause

---

## Frontend Updates Required

### Changes Needed in Frontend
The following frontend files must be updated to pass `subjectId`:

1. **PaperDesigner.tsx** - Add subject selection dropdown
   ```typescript
   // Before: saveQuestionPaperAction(body)
   // After: saveQuestionPaperAction({...body, subjectId: selectedSubjectId})
   ```

2. **API Calls** - Ensure subjectId is passed
   ```typescript
   // All calls to /api/question-papers must include subjectId
   ```

### Compatibility
- ⚠️ **Breaking Change**: Old API will reject requests without subjectId
- ⚠️ **Action Required**: Update frontend before deploying backend

---

## Deployment Steps

### Step 1: Pre-Deployment
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Tag this release
git tag -a v1.0.0-critical-fixes -m "Critical production fixes"
git push origin v1.0.0-critical-fixes
```

### Step 2: Staging Deployment
```bash
# 1. Deploy to staging
git push origin main

# 2. Wait for build to complete
# 3. Run database migration
drizzle-kit migrate --database-url=$STAGING_DB_URL

# 4. Run full test suite
npm run test:e2e

# 5. Load test PDF generation
# 6. Verify error handling
```

### Step 3: Production Deployment
```bash
# 1. Enable maintenance mode
# 2. Run database migration
drizzle-kit migrate

# 3. Deploy code
git push origin main

# 4. Verify deployment
# 5. Disable maintenance mode
# 6. Monitor logs
```

### Step 4: Post-Deployment Monitoring
- [ ] Monitor error logs for first hour
- [ ] Check PDF generation success rate
- [ ] Monitor database performance
- [ ] Verify credit deductions
- [ ] Test user-facing features

---

## Rollback Procedure

If critical issues occur post-deployment:

### Immediate Actions
1. Enable maintenance mode
2. Revert code to previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. Disable maintenance mode
4. Notify users of temporary unavailability

### Investigation
1. Check error logs
2. Review changes that caused issue
3. Test fix in staging
4. Prepare hotfix

### Redeployment
- Deploy hotfix following same procedure
- Test thoroughly before enabling for users

---

## Verification Checklist

### After Deployment
- [ ] Health check passes
- [ ] API endpoints respond correctly
- [ ] Database is accessible
- [ ] PDF generation works
- [ ] Error messages are helpful
- [ ] Logs show no errors
- [ ] User-facing features work

### 24-Hour Check
- [ ] No increased error rate
- [ ] PDF generation success rate > 99%
- [ ] No duplicate IDs in database
- [ ] Papers correctly categorized by subject
- [ ] All users can save papers

### 1-Week Check
- [ ] No regression issues reported
- [ ] Performance metrics normal
- [ ] All features working as expected
- [ ] Credit system working correctly

---

## Team Communication

### Before Deployment
- [ ] Notify team of deployment time
- [ ] Prepare release notes
- [ ] Brief QA team on changes
- [ ] Alert support of potential issues

### During Deployment
- [ ] Post status updates
- [ ] Available for rollback decision
- [ ] Monitor error logs

### After Deployment
- [ ] Send success notification
- [ ] Document any issues encountered
- [ ] Prepare post-mortem if issues occurred

---

## Documentation

### Generated Documents
- [x] CRITICAL_FIXES_SUMMARY.md - Implementation details
- [x] This file - Deployment checklist
- [x] Code comments in all modified files
- [x] Inline documentation for new functions

### User Documentation
- [ ] Update API documentation
- [ ] Add migration guide for partners
- [ ] Prepare breaking changes notice

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | AI Assistant | 2026-01-27 | ✅ Ready |
| Code Review | TBD | | Pending |
| QA Review | TBD | | Pending |
| Product | TBD | | Pending |
| DevOps | TBD | | Pending |

---

## Notes

- All changes are backward compatible except for required `subjectId` parameter
- Database migration is one-way; full backup recommended before execution
- No downtime required for code deployment; maintenance window only for migration
- Estimated total deployment time: 30-45 minutes
- Estimated database migration time: 5-10 minutes (depends on data volume)

---

**Ready for Deployment**: ✅ YES

**Next Step**: Deploy to staging environment and run full test suite.
