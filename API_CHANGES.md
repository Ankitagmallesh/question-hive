# API Changes & Breaking Changes Documentation

**Date**: January 27, 2026  
**Version**: 1.0.0-critical-fixes  
**Impact Level**: HIGH - Breaking changes in place

---

## Breaking Changes

### 1. POST /api/question-papers - REQUIRES subjectId

**Old Signature** (DEPRECATED):
```typescript
POST /api/question-papers
{
  email: string;
  settings: PaperSettings;
  paperQuestions: Question[];
  status?: string;
}
```

**New Signature** (REQUIRED):
```typescript
POST /api/question-papers
{
  email: string;
  subjectId: number;  // ⚠️ NOW REQUIRED
  settings: PaperSettings;
  paperQuestions: Question[];
  status?: string;
}
```

**Migration Path**:
1. Get available subjects from your data
2. User selects subject in UI
3. Pass `subjectId` in POST request

**Error Response if Missing**:
```json
{
  "success": false,
  "error": "Validation error: subjectId: Number must be greater than 0"
}
```

---

## Enhanced Error Handling

### Standardized Error Format

All APIs now return consistent error responses:

```typescript
// Success
{
  "success": true,
  "data": {...}
}

// Error
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": {...} // Only in development mode
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Paper saved |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Email mismatch |
| 404 | Not Found | Paper not found |
| 409 | Conflict | Insufficient credits |
| 422 | Validation Failed | Invalid schema |
| 500 | Server Error | Unexpected error |

---

## Input Validation Changes

### POST /api/question-papers

All inputs are now validated with Zod:

```typescript
{
  id?: string | number;
  email: string;                          // Required, must be valid email
  subjectId: number;                      // ⚠️ REQUIRED, must be > 0
  status?: string;                        // Optional, defaults to "Saved"
  settings: {
    title: string;                        // Required, 1-200 chars
    description?: string;
    duration?: number | string;
    totalMarks?: number | string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    template?: string;
    // ... other optional settings
  };
  paperQuestions: Array<{
    id?: string | number;
    text: string;                         // Required
    type?: string;
    difficulty?: string;
    chapter?: string;
    marks?: number | string;
    options?: Array<{
      text: string;                       // Required
      isCorrect?: boolean;
    }>;
    isAiGenerated?: boolean;
    correctAnswer?: string;
  }>;
}
```

**Validation Errors**:
```json
{
  "success": false,
  "error": "Validation error: settings.title: String must contain at least 1 character(s)"
}
```

### POST /api/export-pdf

Added email validation and consistency check:

```typescript
{
  email: string;                          // Required, verified against auth
  data: {
    title: string;                        // Required, 1-200 chars
    questions: Array<{...}>;              // Required, at least 1
    // ... other PDF settings
  }
}
```

**Validation Check**:
- Email must match authenticated user's email
- Will reject if email mismatch:
  ```json
  {
    "success": false,
    "error": "Email mismatch",
    "code": "FORBIDDEN"
  }
  ```

### GET /api/questions

Query parameters now validated:

```
GET /api/questions?page=1&limit=20&subjectId=5&difficulty=medium

// Validation rules:
page: positive integer (default: 1)
limit: positive integer, max 100 (default: 20)
subjectId: positive integer (optional)
chapterId: positive integer (optional)
difficulty: 'easy' | 'medium' | 'hard' (optional)
type: string (optional)
```

---

## New Error Codes

These error codes can be used for client-side error handling:

```typescript
// Authentication
'UNAUTHORIZED'              // 401
'FORBIDDEN'                 // 403

// Validation
'BAD_REQUEST'              // 400
'UNPROCESSABLE_ENTITY'     // 422

// Business Logic
'INSUFFICIENT_CREDITS'     // 402 - User needs more credits
'DUPLICATE_ENTITY'         // 409 - Entity already exists
'OPERATION_TIMEOUT'        // 408 - Request timed out

// Server Errors
'INTERNAL_SERVER_ERROR'    // 500
'SERVICE_UNAVAILABLE'      // 503
```

---

## API Backward Compatibility

### ❌ NOT Compatible
- `POST /api/question-papers` without `subjectId` → Will fail

### ✅ Still Compatible
- `GET /api/question-papers?email=...` → No changes
- `GET /api/questions` → Parameters now validated but optional
- `POST /api/export-pdf` → Now validates email, but behavior same

---

## Migration Guide for Clients

### Step 1: Add Subject Selection (Frontend)

```typescript
// In your paper creation UI
const [subjectId, setSubjectId] = useState<number | null>(null);

// When saving paper:
const handleSave = async (paperData) => {
  if (!subjectId) {
    alert('Please select a subject');
    return;
  }

  const response = await fetch('/api/question-papers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...paperData,
      subjectId,  // ⚠️ Add this
      email: user.email
    })
  });
};
```

### Step 2: Handle New Error Format

```typescript
const response = await fetch('/api/question-papers', {...});
const data = await response.json();

if (!data.success) {
  // New: Use error code for specific handling
  switch (data.code) {
    case 'INSUFFICIENT_CREDITS':
      showCreditWarning(data.error);
      break;
    case 'BAD_REQUEST':
      showValidationError(data.error);
      break;
    default:
      showGenericError(data.error);
  }
}
```

### Step 3: Update Error Handling

```typescript
// Before
catch (error: any) {
  console.error('Error:', error.message);
}

// After
catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  // Server now returns better formatted errors
}
```

---

## TypeScript Type Updates

### SavePaperInput

```typescript
// apps/web/lib/validators.ts

export interface SavePaperInput {
  id?: string | number;
  settings: PaperSettings;
  paperQuestions: Question[];
  status?: string;
  email: string;
  subjectId: number;  // ⚠️ NEW - REQUIRED
}
```

### Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;  // Development only
}
```

---

## Database Schema Changes

### questions table
```sql
-- Before
id BIGINT PRIMARY KEY NOT NULL

-- After
id BIGSERIAL PRIMARY KEY NOT NULL  -- Auto-increment
```

### question_options table
```sql
-- Before
id BIGINT PRIMARY KEY NOT NULL

-- After
id BIGSERIAL PRIMARY KEY NOT NULL  -- Auto-increment
```

**Impact**: All new questions and options will have auto-generated IDs. No collision risk.

---

## Deployment Notes

### Critical: Frontend Must Be Updated

The backend is now requiring `subjectId` for paper saves. If the frontend is not updated:
- Paper saves will fail with validation error
- Users cannot create or update papers

### Testing Recommendations

1. **Unit Tests**: Test with and without subjectId
2. **Integration Tests**: Full paper creation flow
3. **Load Tests**: Concurrent PDF generation
4. **Error Tests**: Invalid inputs, missing fields

### Monitoring

After deployment, monitor these metrics:

```
- POST /api/question-papers success rate (should be ~100%)
- POST /api/export-pdf success rate (should be > 99%)
- Average response time < 1s for paper save
- PDF generation timeout rate (should be 0%)
- Validation error rate (should be < 1%)
```

---

## Frequently Asked Questions

**Q: Will my existing code break?**
A: Yes, if you're calling `POST /api/question-papers` without `subjectId`. Update to include it.

**Q: Can I rollback to the old API?**
A: Only if you rollback the entire deployment. Partial rollback not possible.

**Q: How do I get available subjects?**
A: Query the database directly or call a new `/api/subjects` endpoint (to be implemented).

**Q: Will this affect existing papers?**
A: No, existing papers continue to work. This only affects new paper creation.

**Q: What about the PDF export changes?**
A: The PDF export now validates email consistency. No breaking changes to functionality.

---

## Support

For API integration issues, refer to:
- [CRITICAL_FIXES_SUMMARY.md](./CRITICAL_FIXES_SUMMARY.md) - Implementation details
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment steps
- `apps/web/lib/validators.ts` - Zod schemas with full documentation

---

**Last Updated**: January 27, 2026  
**Status**: Ready for deployment
