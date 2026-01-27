import { NextResponse } from 'next/server';
import { getQuestions } from '@/server/db/queries/questions';
import { handleApiError, AppErrors } from '@/lib/error-handler';
import { FetchQuestionsSchema, validateInput } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate integers safely
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const subjectIdParam = searchParams.get('subjectId');
    const chapterIdParam = searchParams.get('chapterId');
    
    // Validate input
    const queryValidation = validateInput(FetchQuestionsSchema, {
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 20 : limit,
      subjectId: subjectIdParam ? parseInt(subjectIdParam, 10) : undefined,
      chapterId: chapterIdParam ? parseInt(chapterIdParam, 10) : undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      type: searchParams.get('type') || undefined,
    });

    if (!queryValidation.success) {
      throw AppErrors.BadRequest(`Invalid query parameters: ${queryValidation.error}`);
    }

    const result = await getQuestions({ 
      page: queryValidation.data.page, 
      limit: queryValidation.data.limit 
    });

    return NextResponse.json({ 
      success: true, 
      ...result
    });

  } catch (error) {
    return handleApiError(error, process.env.NODE_ENV === 'development');
  }
}
