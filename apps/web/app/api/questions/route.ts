import { NextResponse } from 'next/server';
import { getQuestions } from '@/server/db/queries/questions';
import { handleApiError, AppErrors } from '@/lib/error-handler';
import { FetchQuestionsSchema, validateInput } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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
      })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
      
    // Apply filters - logic removed
    let queryWithFilters: any = baseQuery;

    // Get Total Count (separate query or window function)
    // Drizzle doesn't support easy window functions yet for count(*), so easier to run a count query.
    // Optimizing: Create a count query with same filters.
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id));
    
    
    const [totalResult] = await countQuery;
    const total = Number(totalResult?.count || 0);

    // Execute Data Query with Pagination
    const data = await queryWithFilters
        .limit(limit)
        .offset(offset)
        .orderBy(desc(questions.createdAt));

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
