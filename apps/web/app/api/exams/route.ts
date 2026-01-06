import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { exams } from '@repo/db';

export async function GET() {
  try {
  const data = await db.select().from(exams).orderBy(exams.name);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
