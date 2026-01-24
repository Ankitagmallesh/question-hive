import { NextResponse } from 'next/server';
import { getExams } from '../../server/db/queries/exams';

export async function GET() {
  try {
    const data = await getExams();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('Error fetching exams:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
