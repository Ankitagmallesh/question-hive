import { NextResponse } from 'next/server';
import { getSubjects } from '../../server/db/queries/subjects';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    const examIdNum = examId ? Number(examId) : undefined;

    const data = await getSubjects(examIdNum);
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
