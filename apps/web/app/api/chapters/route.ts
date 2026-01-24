import { NextResponse } from 'next/server';
import { getChapters } from '../../server/db/queries/chapters';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const subjectIdNum = subjectId ? Number(subjectId) : undefined;

    const data = await getChapters(subjectIdNum);
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
