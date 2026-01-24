import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { chapters, eq } from '@repo/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const data = subjectId
      ? await db.select().from(chapters).where(eq(chapters.subjectId, Number(subjectId))).orderBy(chapters.name)
      : await db.select().from(chapters).orderBy(chapters.name);

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
