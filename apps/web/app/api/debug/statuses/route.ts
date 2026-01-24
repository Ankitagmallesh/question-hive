import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questionPaperStatuses } from '@repo/db';

export async function GET() {
    try {
        const statuses = await db.select().from(questionPaperStatuses);
        return NextResponse.json({ success: true, statuses });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
