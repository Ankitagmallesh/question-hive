import { unstable_cache, revalidateTag } from 'next/cache';

/**
 * Request deduplication cache - prevents multiple identical requests in the same render
 * Maps request keys to promises to ensure single execution
 */
const requestDedupCache = new Map<string, Promise<any>>();

/**
 * Generate a cache key from request parameters
 */
export const generateCacheKey = (namespace: string, ...params: any[]): string => {
  const serialized = JSON.stringify(params);
  return `${namespace}:${serialized}`;
};

/**
 * Server-side caching wrapper with automatic request deduplication
 * Prevents multiple identical queries within the same request context
 *
 * @param queryFn The async function to execute (typically a database query)
 * @param keyParams Parameters used to generate the cache key
 * @param options Caching options (revalidation time, tags, etc.)
 * @returns Promise with cached result
 */
export const cachedQuery = async <T>(
  queryFn: () => Promise<T>,
  keyParams: string[],
  options?: {
    revalidate?: number | false; // Time in seconds, or false for no revalidation
    tags?: string[];
    namespace?: string;
  }
): Promise<T> => {
  const namespace = options?.namespace || 'query';
  const cacheKey = generateCacheKey(namespace, ...keyParams);

  // Request deduplication: If same request is in flight, return that promise
  if (requestDedupCache.has(cacheKey)) {
    return requestDedupCache.get(cacheKey)!;
  }

  // Create the cached query function
  const cachedFn = unstable_cache(
    queryFn,
    [cacheKey],
    {
      revalidate: options?.revalidate ?? 3600, // Default 1 hour
      tags: options?.tags ?? [namespace],
    }
  );

  // Execute and store promise for deduplication
  const promise = cachedFn();
  requestDedupCache.set(cacheKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    // Clean up dedup cache after request completes
    // Note: In practice, this happens automatically between requests
    requestDedupCache.delete(cacheKey);
  }
};

/**
 * Wrapper for database queries with intelligent caching
 * Automatically deduplicates requests and manages cache invalidation
 */
export const cachedDbQuery = async <T>(
  queryFn: () => Promise<T>,
  cacheKey: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): Promise<T> => {
  return cachedQuery(queryFn, cacheKey, {
    namespace: 'db',
    ...options,
  });
};

/**
 * Revalidate a specific cache tag (invalidates all queries with that tag)
 * Useful for mutations that affect cached data
 */
export const revalidateCacheTag = (tag: string): void => {
  revalidateTag(tag);
};

/**
 * Common cache revalidation for entity types
 */
export const revalidateEntity = (
  entity: 'exams' | 'subjects' | 'chapters' | 'questions' | 'profiles'
): void => {
  revalidateTag(entity);
};

/**
 * User-specific cache invalidation (e.g., after profile update)
 */
export const revalidateUserCache = (userId: number | string): void => {
  revalidateTag(`user-${userId}`);
  revalidateTag('profile');
};

/**
 * Paper-specific cache invalidation
 */
export const revalidatePaperCache = (paperId?: number): void => {
  if (paperId) {
    revalidateTag(`paper-${paperId}`);
  }
  revalidateTag('papers');
};

/**
 * Clear all caches for a user (profile, papers, etc.)
 */
export const clearUserCaches = (email: string, userId?: number): void => {
  revalidateTag(`profile-${email}`);
  if (userId) {
    revalidateTag(`user-${userId}`);
  }
  revalidateTag('profiles');
  revalidateTag('papers');
};
