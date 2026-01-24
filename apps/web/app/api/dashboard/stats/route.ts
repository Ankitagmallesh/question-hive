import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questions, questionTypes, difficultyLevels, questionPapers, questionPaperItems, users, questionPaperStatuses, eq, sql, or, and, inArray, isNotNull, gt } from '@repo/db';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

const getDashboardStats = async (userId: number) => {
    // DEBUG: Log context
    console.log('[DashboardStats] Fetching for userId:', userId);
    
    // Check all statuses available
    const allStatuses = await db.select().from(questionPaperStatuses);
    console.log('[DashboardStats] Available Statuses:', allStatuses.map((s: { id: number, name: string }) => `${s.id}:${s.name}`));

    // 2. Identify Target Statuses (Saved / Published)
    // Note: If user saves as 'Draft', it won't show up here.
    const targetStatuses = allStatuses.filter((s: { name: string }) => s.name === 'Saved' || s.name === 'Published');
    console.log('[DashboardStats] Target Status IDs:', targetStatuses.map((s: { id: number }) => s.id));
    
    let totalPapers = 0;
    let totalQuestionsInPapers = 0;
    let typeBreakdown: unknown[] = [];
    let difficultyBreakdown: unknown[] = [];

    if (targetStatuses.length > 0) {
        const statusIds = targetStatuses.map((s: { id: number }) => s.id);

        // A. Total Papers
        const totalPapersRes = await db.select({ count: sql<number>`count(DISTINCT ${questionPapers.id})` })
            .from(questionPapers)
            .innerJoin(questionPaperItems, eq(questionPapers.id, questionPaperItems.questionPaperId))
            .where(and(
                eq(questionPapers.createdBy, userId),
                inArray(questionPapers.statusId, statusIds),
                isNotNull(questionPapers.durationMinutes),
                gt(questionPapers.totalMarks, 0)
            ));
        totalPapers = Number(totalPapersRes[0]?.count || 0);

        // B. Total Questions (Unique questions in valid papers)
        const totalQuestionsRes = await db.select({ count: sql<number>`count(DISTINCT ${questionPaperItems.questionId})` })
            .from(questionPaperItems)
            .innerJoin(questionPapers, eq(questionPaperItems.questionPaperId, questionPapers.id))
            .where(and(
                eq(questionPapers.createdBy, userId),
                inArray(questionPapers.statusId, statusIds)
            ));
        totalQuestionsInPapers = Number(totalQuestionsRes[0]?.count || 0);

        // C. Type Breakdown (from valid papers)
        typeBreakdown = await db
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
    }

    // D. Difficulty Breakdown (ALL active questions in DB - Per User Request)
    difficultyBreakdown = await db
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
    
    console.log(`[DashboardStats] Papers: ${totalPapers}, QuestionsInPapers: ${totalQuestionsInPapers}, TotalDBQuestions: ${difficultyBreakdown.reduce((acc, curr) => acc + Number(curr.count), 0)}`);

    // E. Recent Papers (Limit 5)
    // We want the most recently updated papers that serve the user's workflow
    // It's useful to show drafts too so they can resume work.
    const recentPapers = await db.select({
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

    return {
        recentPapers,
        totalQuestions: totalQuestionsInPapers,
        totalPapers,
        typeBreakdown: typeBreakdown.map((t: { type: string, count: number }) => ({ ...t, count: Number(t.count) })),
        difficultyBreakdown: difficultyBreakdown.map((d: { difficulty: string, count: number }) => ({ ...d, count: Number(d.count) }))
    };
};

export async function GET() {
  try {
    // Better: Fetch the first user.
    const userRes = await db.select({ id: users.id }).from(users).limit(1);
    const userId = Number(userRes[0]?.id || 1); 

    const stats = await getDashboardStats(userId);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: Error) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
