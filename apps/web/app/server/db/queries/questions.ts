import { db, questions, difficultyLevels, questionTypes } from '@repo/db';
import { eq, desc, sql } from 'drizzle-orm';
import { cachedDbQuery } from '../../../lib/cache';

export type GetQuestionsParams = {
  page?: number;
  limit?: number;
};

/**
 * Fetch paginated questions with joins and metadata
 * - Cached for 1 hour per page/limit combination
 * - Request deduplication prevents multiple DB hits
 * - Cache tag: 'questions' - revalidate on changes
 */
export const getQuestions = async (params: GetQuestionsParams) => {
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  return cachedDbQuery(
    async () => {
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
    },
    ['questions', `page-${page}`, `limit-${limit}`],
    {
      revalidate: 3600, // 1 hour
      tags: ['questions'],
    }
  );
};
