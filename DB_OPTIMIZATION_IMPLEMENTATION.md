# Database Optimization - Implementation Guide

## Quick Start

This guide walks through the database optimization changes and how to use them.

## What Changed

### 1. Database Client (`packages/db/src/client.ts`)

The database client is now a true singleton with optimized connection pooling for Supabase.

**Key Features:**
- Single connection pool reused across all requests
- Automatic connection cleanup
- Optimized for PgBouncer (Supabase Transaction Pooler)
- Graceful shutdown for serverless environments

### 2. Caching Layer (`apps/web/app/lib/cache.ts`)

New comprehensive caching infrastructure with request deduplication.

**Key Features:**
- `cachedDbQuery()` - Cache database queries with automatic deduplication
- `revalidateCacheTag()` - Invalidate specific cache tags
- `clearUserCaches()` - Clear all user-related caches

## Using the Caching System

### For Query Functions

All query functions now use the unified caching layer:

```typescript
import { db, exams } from '@repo/db';
import { cachedDbQuery } from '../../lib/cache';
import { asc } from 'drizzle-orm';

export const getExams = async () => {
  return cachedDbQuery(
    async () => {
      return await db.select().from(exams).orderBy(asc(exams.name));
    },
    ['exams-all'],  // Cache key
    {
      revalidate: 3600,    // Cache for 1 hour
      tags: ['exams'],     // Revalidation tag
    }
  );
};
```

### For Mutations (Cache Invalidation)

When data changes, invalidate the relevant cache:

```typescript
import { revalidateCacheTag, clearUserCaches } from '../../lib/cache';

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const result = await updateProfileMutation(input);
    
    // Invalidate all user caches
    clearUserCaches(input.email);
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

## Cache Strategy

### Read-Only Data (Use Long TTL)
```typescript
// These rarely change, cache for a long time
getExams()      // 1 hour cache
getSubjects()   // 1 hour cache
getChapters()   // 1 hour cache
```

### User-Specific Data (Use Medium TTL)
```typescript
// These change when user takes action, shorter TTL
getProfileByEmail() // 60 second cache
getDashboardStats() // 1 hour cache
getQuestionPapers() // 1 hour cache
```

### On Write Operations
```typescript
// Always revalidate after mutations
updateProfile() → clearUserCaches(email)
saveQuestionPaper() → revalidateCacheTag('papers')
createQuestion() → revalidateCacheTag('questions')
```

## Environment Setup

### 1. Configure Database Connection

Set your connection string in `.env.local`:

```bash
# Preferred: Use Supabase's pooled connection (recommended)
SUPABASE_DB_POOLED_URL=postgresql://user:password@host.supabase.co:6543/postgres?schema=public&pgbouncer=true

# Or use the connect URL (will work, but less efficient)
SUPABASE_DB_CONNECT_URL=postgresql://user:password@host.supabase.co:5432/postgres?schema=public

# Or the generic DATABASE_URL
DATABASE_URL=postgresql://...
```

**Note**: The pooled URL (ending in `:6543`) is preferred for serverless environments as it uses Supabase's transaction pooler.

### 2. Verify Connection

Run a test to verify the database connection:

```bash
cd apps/web
bun run ../packages/db/src/debug-check.ts
```

## Performance Monitoring

### Check Cache Hit Rate

Add logging to `apps/web/app/lib/cache.ts`:

```typescript
export const cachedQuery = async <T>(
  queryFn: () => Promise<T>,
  keyParams: string[],
  options?: CacheOptions
): Promise<T> => {
  const cacheKey = generateCacheKey(namespace, ...keyParams);
  const isCacheHit = requestDedupCache.has(cacheKey);
  
  // Log cache hits for monitoring
  console.log(`[Cache] ${isCacheHit ? 'HIT' : 'MISS'}: ${cacheKey}`);
  
  // ... rest of implementation
};
```

### Monitor Database Connections

```typescript
// In packages/db/src/client.ts
const conn = postgres(connectionString, {
  onclose: () => console.log('[DB] Connection closed'),
  onopen: () => console.log('[DB] Connection opened'),
  // ... other config
});
```

## Troubleshooting

### Issue: "Missing database connection string"

**Solution**: Ensure one of these env vars is set:
- `SUPABASE_DB_POOLED_URL` (preferred)
- `SUPABASE_DB_CONNECT_URL`
- `DATABASE_URL`

### Issue: Connection pool exhausted

**Symptoms**: Errors like "Pool exhausted" or timeouts

**Solution**: 
- Check pool size in `packages/db/src/client.ts`
- Verify cache is working (reduce DB load)
- Increase `max` connections if workload requires

### Issue: Stale cache after updates

**Problem**: Changes not showing immediately

**Solution**: Ensure cache invalidation is called:
```typescript
// After any mutation
revalidateCacheTag('relevant-tag');
// or
clearUserCaches(email);
```

### Issue: Request Deduplication Not Working

**Symptoms**: Same query hitting DB multiple times

**Debug**:
```typescript
// Add logging in cache.ts
if (requestDedupCache.has(cacheKey)) {
  console.log('[Dedup] Request reused:', cacheKey);
}
```

## Migration Cleanup

The database has been cleaned up:

**Removed**: `packages/db/migrations/0001_curved_mandarin.sql`
- This was an orphaned migration file
- The journal only tracks `0001_icy_hawkeye.sql`

**Current migrations**:
1. `0000_icy_marvel_zombies.sql` - Base schema
2. `0001_icy_hawkeye.sql` - Indexes and credits
3. `0002_fuzzy_komodo.sql` - Institutions and papers
4. `0003_add_user_profile_fields.sql` - User extensions

If you need to add more migrations, always generate them with:
```bash
bun run --filter=@repo/db generate
```

## Adding New Cached Queries

When you add a new query:

1. **Create the query function**:
```typescript
import { cachedDbQuery } from '../../lib/cache';

export const getMyData = async (userId: number) => {
  return cachedDbQuery(
    async () => {
      return await db.select().from(myTable).where(eq(myTable.userId, userId));
    },
    ['my-data', `user-${userId}`],
    {
      revalidate: 3600,
      tags: [`my-data-${userId}`, 'my-data'],
    }
  );
};
```

2. **Add cache invalidation on mutations**:
```typescript
export async function updateMyData(input: any) {
  const result = await updateMutation(input);
  
  // Invalidate affected caches
  revalidateCacheTag(`my-data-${input.userId}`);
  
  return result;
}
```

3. **Use consistent cache key patterns**:
```
'entity'                   // All instances
'entity-${id}'            // Specific instance
'entity-${userId}'        // User-specific
'entity-${id}-v2'         // Versioned cache
```

## API Endpoints

Endpoints using the caching system:

| Endpoint | Cache TTL | Dedup | Query |
|----------|-----------|-------|-------|
| GET /api/exams | 1 hour | ✅ | getExams |
| GET /api/subjects | 1 hour | ✅ | getSubjects |
| GET /api/chapters | 1 hour | ✅ | getChapters |
| GET /api/questions | 1 hour | ✅ | getQuestions |
| GET /api/profile | 60 sec | ✅ | getProfileByEmail |
| GET /api/dashboard/stats | 1 hour | ✅ | getDashboardStats |
| GET /api/question-papers | 1 hour | ✅ | getQuestionPapers |
| GET /api/question-papers/:id | 1 hour | ✅ | getQuestionPaperById |

## References

- [Next.js Data Cache Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [PostgreSQL JDBC Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)

## Support

For issues or questions about the database optimization:

1. Check the troubleshooting section above
2. Review [DB_OPTIMIZATION_AUDIT.md](./DB_OPTIMIZATION_AUDIT.md) for detailed implementation
3. Check logs in `apps/web/.next` for cache behavior
4. Monitor Supabase dashboard for connection metrics
