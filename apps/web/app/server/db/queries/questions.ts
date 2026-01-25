import { db, questions, difficultyLevels, questionTypes } from '@repo/db';
import { eq, desc, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export type GetQuestionsParams = {
  page?: number;
  limit?: number;
};

const getQuestionsInternal = async ({ page = 1, limit = 20 }: GetQuestionsParams) => {
  const offset = (page - 1) * limit;

  const dataPromise = db
    .select({
      id: questions.id,
      content: questions.content,
      marks: questions.marks,
      difficultyLevelId: questions.difficultyLevelId,
      difficulty: difficultyLevels.name,
      questionType: questionTypes.name,
      questionTypeId: questions.questionTypeId,
      createdAt: questions.createdAt,
    })
    .from(questions)
    .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
    .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(questions.createdAt));

  const countPromise = db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
    .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id));

  const [data, [totalResult]] = await Promise.all([dataPromise, countPromise]);
  
  const total = Number(totalResult?.count || 0);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getQuestions = async (params: GetQuestionsParams) => {
  // We wrap the internal function with unstable_cache
  // Note: unstable_cache arguments must be strings/numbers. Objects need serialization if dynamic.
  // Since we have page/limit, we can include them in the key parts.
  
  const cacheKey = ['questions', `page-${params.page}`, `limit-${params.limit}`];
  
  return unstable_cache(
    async () => getQuestionsInternal(params),
    cacheKey,
    {
      tags: ['questions'],
      revalidate: 3600, // 1 hour default
    }
  )();
};
