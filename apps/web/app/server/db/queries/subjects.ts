import { db, subjects } from '@repo/db';
import { eq, asc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getSubjects = async (examId?: number) => {
  const cacheKey = examId ? ['subjects', `exam-${examId}`] : ['subjects', 'all'];

  return unstable_cache(
    async () => {
      if (examId) {
        // Use database filtering instead of JS filtering
        return await db
          .select()
          .from(subjects)
          .where(eq(subjects.examId, examId))
          .orderBy(asc(subjects.name));
      } else {
        return await db.select().from(subjects).orderBy(asc(subjects.name));
      }
    },
    cacheKey,
    {
      tags: ['subjects'],
      revalidate: 3600, // 1 hour
    }
  )();
};
