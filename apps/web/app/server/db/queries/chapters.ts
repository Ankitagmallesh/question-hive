import { db, chapters } from '@repo/db';
import { eq, asc } from 'drizzle-orm';
import { cachedDbQuery } from '../../../lib/cache';

/**
 * Fetch chapters with optional subject filtering
 * - Cached for 1 hour
 * - Request deduplication prevents multiple DB hits
 * - Cache tag: 'chapters' - revalidate on changes
 */
export const getChapters = async (subjectId?: number) => {
  return cachedDbQuery(
    async () => {
      if (subjectId) {
        return await db
          .select()
          .from(chapters)
          .where(eq(chapters.subjectId, subjectId))
          .orderBy(asc(chapters.name));
      } else {
        return await db.select().from(chapters).orderBy(asc(chapters.name));
      }
    },
    subjectId ? ['chapters', `subject-${subjectId}`] : ['chapters', 'all'],
    {
      revalidate: 3600, // 1 hour
      tags: ['chapters'],
    }
  );
};
