import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { subjects, eq } from '@repo/db';

type SubjectRow = { examId: number; [key: string]: unknown };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    let data: SubjectRow[];
    if (!examId) {
      data = await db.select().from(subjects).orderBy(subjects.name);
    } else {
  const examIdNum = Number(examId);
  // Filter manually to avoid cross-package Column type conflicts
  const all = await db.select().from(subjects).orderBy(subjects.name);
  data = all.filter((r: SubjectRow) => r.examId === examIdNum);
    }
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
