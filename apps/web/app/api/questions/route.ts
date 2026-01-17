import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { questions, difficultyLevels, questionTypes } from '@repo/db';
import { eq, and, sql, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    // Search and filter logic removed as per request
    // const search = searchParams.get('search') || '';
    // const type = searchParams.get('type') || 'all';
    // const difficulty = searchParams.get('difficulty') || 'all';

    const conditions: any[] = [];
    const offset = (page - 1) * limit;


    // Base Query for Data
    const baseQuery = db
      .select({
        id: questions.id,
        content: questions.content,
        marks: questions.marks,
        difficultyLevelId: questions.difficultyLevelId,
        difficulty: difficultyLevels.name,
        questionType: questionTypes.name,
        questionTypeId: questions.questionTypeId,
        createdAt: questions.createdAt,
        // chapters: chapters.name // If needed later
      })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
      // .leftJoin(chapters, ...) // If chapter filter needed
      
    // Apply filters
    let queryWithFilters: any = baseQuery;
    if (conditions.length > 0) {
      queryWithFilters = queryWithFilters.where(and(...conditions));
    }

    // Get Total Count (separate query or window function)
    // Drizzle doesn't support easy window functions yet for count(*), so easier to run a count query.
    // Optimizing: Create a count query with same filters.
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id));
    
    if (conditions.length > 0) {
        // @ts-ignore - Valid Drizzle usage despite type noise
        countQuery.where(and(...conditions));
    }
    
    const [totalResult] = await countQuery;
    const total = Number(totalResult?.count || 0);

    // Execute Data Query with Pagination
    const data = await queryWithFilters
        .limit(limit)
        .offset(offset)
        .orderBy(desc(questions.createdAt));

    return NextResponse.json({ 
        success: true, 
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
