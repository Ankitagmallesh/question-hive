import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { chapters, eq } from '@repo/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    let data: unknown[];
    if (subjectId) {
      data = await db.select().from(chapters).where(eq(chapters.subjectId, Number(subjectId))).orderBy(chapters.name);
    } else {
      data = await db.select().from(chapters).orderBy(chapters.name);
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
