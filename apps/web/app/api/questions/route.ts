import { NextResponse } from 'next/server';
import { getQuestions } from '@/server/db/queries/questions';
import { handleApiError, AppErrors } from '@/lib/error-handler';
import { FetchQuestionsSchema, validateInput } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate input
    const queryValidation = validateInput(FetchQuestionsSchema, {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      subjectId: searchParams.get('subjectId') ? parseInt(searchParams.get('subjectId')!) : undefined,
      chapterId: searchParams.get('chapterId') ? parseInt(searchParams.get('chapterId')!) : undefined,
      difficulty: searchParams.get('difficulty'),
      type: searchParams.get('type'),
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
