import { db, subjects } from '@repo/db';
import { eq, asc } from 'drizzle-orm';
import { cachedDbQuery } from '../../../lib/cache';

/**
 * Fetch subjects with optional exam filtering
 * - Cached for 1 hour
 * - Request deduplication prevents multiple DB hits
 * - Cache tag: 'subjects' - revalidate on changes
 */
export const getSubjects = async (examId?: number) => {
  return cachedDbQuery(
    async () => {
      if (examId) {
        return await db
          .select()
          .from(subjects)
          .where(eq(subjects.examId, examId))
          .orderBy(asc(subjects.name));
      } else {
        return await db.select().from(subjects).orderBy(asc(subjects.name));
      }
    },
    examId ? ['subjects', `exam-${examId}`] : ['subjects', 'all'],
    {
      revalidate: 3600, // 1 hour
      tags: ['subjects'],
    }
  );
};
