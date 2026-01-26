import { db, questionPapers, questionPaperItems, questionPaperStatuses, sql, eq, desc, asc, and, inArray, questions, questionTypes, difficultyLevels, chapters, users, questionOptions } from '@repo/db';
import { cachedDbQuery } from '../../../lib/cache';

// --- Types ---
export interface QuestionPaperListItem {
  id: string;
  savedAt: Date | null;
  settings: any;
  paperQuestions: any[];
}

export interface QuestionPaperDetail {
  id: string;
  settings: any;
  paperQuestions: any[];
  savedAt: Date | null;
}

// --- Queries ---

/**
 * Fetch all question papers for a user with caching
 * - Cached for 1 hour per user
 * - Request deduplication prevents multiple DB hits
 * - Cache tag: `question-papers-user-${userId}` - revalidate on changes
 */
export const getQuestionPapers = async (userId: number) => {
  return cachedDbQuery(
    async () => {
      const papers = await db.select({
        id: questionPapers.id,
        title: questionPapers.title,
        updatedAt: questionPapers.updatedAt,
        status: questionPaperStatuses.name,
        instructions: questionPapers.instructions,
        questionsCount: sql<number>`(SELECT count(*) FROM ${questionPaperItems} WHERE ${questionPaperItems.questionPaperId} = ${questionPapers.id})`
      })
        .from(questionPapers)
        .leftJoin(questionPaperStatuses, eq(questionPapers.statusId, questionPaperStatuses.id))
        .where(eq(questionPapers.createdBy, userId))
        .orderBy(desc(questionPapers.updatedAt));

      // Transform results
      return papers.map(p => {
        let settings: any = {};
        try {
          settings = typeof p.instructions === 'string' ? JSON.parse(p.instructions) : p.instructions;
        } catch (e) { }

        return {
          id: String(p.id),
          savedAt: p.updatedAt,
          settings: {
            title: p.title,
            difficulty: settings.difficulty || 'mixed',
            chapters: settings.template ? [] : [],
            ...settings
          },
          paperQuestions: Array(Number(p.questionsCount)).fill({})
        };
      });
    },
    ['question-papers-list', `user-${userId}`],
    {
      revalidate: 3600, // 1 hour
      tags: [`question-papers-user-${userId}`, 'papers'],
    }
  );
};

/**
 * Fetch a single question paper by ID with all details
 * - Cached for 1 hour per paper
 * - Includes questions, options, and metadata
 * - Cache tag: `question-paper-${paperId}` - revalidate on changes
 */
export const getQuestionPaperById = async (paperId: number) => {
  return cachedDbQuery(
    async () => {
      // 1. Fetch Paper Metadata
      const paperRes = await db.select().from(questionPapers).where(eq(questionPapers.id, paperId));

      if (paperRes.length === 0) {
        return null;
      }

      const paper = paperRes[0];
      if (!paper) return null;

      let settings: any = {};
      try {
        const parsed = typeof paper.instructions === 'string' ? JSON.parse(paper.instructions) : paper.instructions;
        settings = parsed && typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        settings = {};
      }

      const fullSettings = {
        ...settings,
        title: paper.title || '',
        duration: String(paper.durationMinutes || 0),
        totalMarks: String(paper.totalMarks || 0)
      };

      // 2. Fetch Items
      const items = await db.select({
        itemId: questionPaperItems.id,
        order: questionPaperItems.orderIndex,
        marks: questionPaperItems.marks,
        qId: questions.id,
        qText: questions.content,
        qType: questionTypes.name,
        qDiff: difficultyLevels.name,
        qChapter: chapters.name,
      })
        .from(questionPaperItems)
        .innerJoin(questions, eq(questionPaperItems.questionId, questions.id))
        .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
        .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
        .leftJoin(chapters, eq(questions.chapterId, chapters.id))
        .where(eq(questionPaperItems.questionPaperId, paperId))
        .orderBy(asc(questionPaperItems.orderIndex));

      // 2.1 Fetch Options for these questions
      const questionIds = items.map(i => i.qId).filter((id): id is number => id !== null && id !== undefined);

      let optionsMap: Record<number, any[]> = {};

      if (questionIds.length > 0) {
        const optionsRes = await db.select({
          id: questionOptions.id,
          questionId: questionOptions.questionId,
          text: questionOptions.optionText,
          isCorrect: questionOptions.isCorrect,
          order: questionOptions.optionOrder
        })
          .from(questionOptions)
          .where(inArray(questionOptions.questionId, questionIds))
          .orderBy(questionOptions.optionOrder);

        // Group options by questionId
        optionsRes.forEach(opt => {
          if (!optionsMap[opt.questionId]) {
            optionsMap[opt.questionId] = [];
          }
          optionsMap[opt.questionId]!.push({
            id: String(opt.id),
            text: opt.text,
            isCorrect: opt.isCorrect
          });
        });
      }

      // 3. Transform Questions
      const papersQuestions = items.map((item: any) => {
        return {
          id: String(item.qId),
          instanceId: String(item.itemId),
          text: item.qText,
          type: item.qType,
          difficulty: item.qDiff?.toLowerCase() || 'medium',
          chapter: item.qChapter,
          marks: item.marks,
          options: optionsMap[item.qId] || []
        };
      });

      return {
        id: String(paper.id),
        settings: fullSettings,
        paperQuestions: papersQuestions,
        savedAt: paper.updatedAt ?? new Date()
      };
    },
    ['question-paper', `id-${paperId}`],
    {
      revalidate: 3600, // 1 hour
      tags: [`question-paper-${paperId}`, 'papers'],
    }
  );
};
