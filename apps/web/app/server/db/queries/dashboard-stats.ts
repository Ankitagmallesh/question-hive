import { db, questionPapers, questionPaperItems, questionPaperStatuses, questions, questionTypes, difficultyLevels, eq, sql, and, inArray, isNotNull, gt } from '@repo/db';
import { unstable_cache } from 'next/cache';

export const getDashboardStats = async (userId: number) => {
  return unstable_cache(
    async () => {
      // DEBUG: Log context
      // console.log('[DashboardStats] Fetching for userId:', userId);
      
      // Check all statuses available
      const allStatuses = await db.select().from(questionPaperStatuses);
      
      // 2. Identify Target Statuses (Saved / Published)
      const targetStatuses = allStatuses.filter((s: { name: string }) => s.name === 'Saved' || s.name === 'Published');
      
      let totalPapers = 0;
      let totalQuestionsInPapers = 0;
      let typeBreakdown: any[] = [];
      let difficultyBreakdown: any[] = [];
      let recentPapers: any[] = [];

      // D. Difficulty Breakdown (ALL active questions in DB - Per User Request)
      // This is independent of paper status, so we can run it regardless
      const difficultyBreakdownPromise = db
          .select({
              difficulty: difficultyLevels.name,
              count: sql<number>`count(${questions.id})`
          })
          .from(questions)
          .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
          .where(and(
              eq(questions.createdBy, userId),
              eq(questions.isActive, true)
          ))
          .groupBy(difficultyLevels.name);
          
      // E. Recent Papers (Limit 5)
      // Also can be run independently, though usually we want to show valid papers. 
      // Existing logic filtered by nothing specific other than createdBy, but logically should probably match the dashboard filter?
      // The original code just filtered by createdBy. We'll keep it consistent but maybe add status filter if needed?
      // Original code: .where(eq(questionPapers.createdBy, userId))
      const recentPapersPromise = db.select({
              id: questionPapers.id,
              title: questionPapers.title,
              status: questionPaperStatuses.name,
              updatedAt: questionPapers.updatedAt
          })
          .from(questionPapers)
          .leftJoin(questionPaperStatuses, eq(questionPapers.statusId, questionPaperStatuses.id))
          .where(eq(questionPapers.createdBy, userId))
          .orderBy(sql`${questionPapers.updatedAt} DESC`)
          .limit(5);

      if (targetStatuses.length > 0) {
          const statusIds = targetStatuses.map((s: { id: number }) => s.id);

          // A. Total Papers
          const totalPapersPromise = db.select({ count: sql<number>`count(DISTINCT ${questionPapers.id})` })
              .from(questionPapers)
              .innerJoin(questionPaperItems, eq(questionPapers.id, questionPaperItems.questionPaperId))
              .where(and(
                  eq(questionPapers.createdBy, userId),
                  inArray(questionPapers.statusId, statusIds),
                  isNotNull(questionPapers.durationMinutes),
                  gt(questionPapers.totalMarks, 0)
              ));

          // B. Total Questions (Unique questions in valid papers)
          const totalQuestionsPromise = db.select({ count: sql<number>`count(DISTINCT ${questionPaperItems.questionId})` })
              .from(questionPaperItems)
              .innerJoin(questionPapers, eq(questionPaperItems.questionPaperId, questionPapers.id))
              .where(and(
                  eq(questionPapers.createdBy, userId),
                  inArray(questionPapers.statusId, statusIds)
              ));

          // C. Type Breakdown (from valid papers)
          const typeBreakdownPromise = db
              .select({
                  type: questionTypes.name,
                  count: sql<number>`count(DISTINCT ${questionPaperItems.questionId})`
              })
              .from(questionPaperItems)
              .innerJoin(questionPapers, eq(questionPaperItems.questionPaperId, questionPapers.id))
              .innerJoin(questions, eq(questionPaperItems.questionId, questions.id))
              .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
              .where(and(
                  eq(questionPapers.createdBy, userId),
                  inArray(questionPapers.statusId, statusIds)
              ))
              .groupBy(questionTypes.name);

          // Await all promises in parallel
          const [
              totalPapersRes, 
              totalQuestionsRes, 
              typeBreakdownRes, 
              difficultyBreakdownRes, 
              recentPapersRes
          ] = await Promise.all([
              totalPapersPromise,
              totalQuestionsPromise,
              typeBreakdownPromise,
              difficultyBreakdownPromise,
              recentPapersPromise
          ]);

          totalPapers = Number(totalPapersRes[0]?.count || 0);
          totalQuestionsInPapers = Number(totalQuestionsRes[0]?.count || 0);
          typeBreakdown = typeBreakdownRes;
          difficultyBreakdown = difficultyBreakdownRes;
          recentPapers = recentPapersRes;

      } else {
          // Fallback if no valid statuses (unlikely)
          const [difficultyBreakdownRes, recentPapersRes] = await Promise.all([
              difficultyBreakdownPromise,
              recentPapersPromise
          ]);
          difficultyBreakdown = difficultyBreakdownRes;
          recentPapers = recentPapersRes;
      }

      return {
          stats: {
              totalPapers,
              totalQuestions: totalQuestionsInPapers,
              typeBreakdown,
              difficultyBreakdown
          },
          recentPapers
      };
    },
    [`dashboard-stats-${userId}`],
    {
      tags: [`dashboard-stats-${userId}`, `question-papers-user-${userId}`], // Invalidate when user papers change
      revalidate: 3600
    }
  )();
};
