import { db, chapters } from '@repo/db';
import { eq, asc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getChapters = async (subjectId?: number) => {
  const cacheKey = subjectId ? ['chapters', `subject-${subjectId}`] : ['chapters', 'all'];

  return unstable_cache(
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
    cacheKey,
    {
      tags: ['chapters'],
      revalidate: 3600, // 1 hour
    }
  )();
};
