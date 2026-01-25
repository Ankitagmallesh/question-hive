import { db, exams } from '@repo/db';
import { unstable_cache } from 'next/cache';
import { asc } from 'drizzle-orm';

const getExamsInternal = async () => {
  return await db.select().from(exams).orderBy(asc(exams.name));
};

export const getExams = unstable_cache(
  async () => getExamsInternal(),
  ['all-exams'],
  {
    tags: ['exams'],
    revalidate: 3600, // 1 hour
  }
);
