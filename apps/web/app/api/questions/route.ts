import { NextResponse } from 'next/server';
import { getQuestions } from '../../server/db/queries/questions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getQuestions({ page, limit });

    return NextResponse.json({ 
        success: true, 
        ...result
    });

  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
