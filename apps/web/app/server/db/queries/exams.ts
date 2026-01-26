import { db, exams } from '@repo/db';
import { cachedDbQuery } from '../../../lib/cache';
import { asc } from 'drizzle-orm';

/**
 * Fetch all active exams with intelligent caching
 * - Cached for 1 hour
 * - Request deduplication prevents multiple DB hits
 * - Cache tag: 'exams' - revalidate on exam modifications
 */
export const getExams = async () => {
  return cachedDbQuery(
    async () => {
      const result = await db.select().from(exams).orderBy(asc(exams.name));
      return result;
    },
    ['exams-all'], // Cache key
    {
      revalidate: 3600, // 1 hour
      tags: ['exams'],
    }
  );
};
