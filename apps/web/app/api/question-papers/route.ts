import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { users, eq } from '@repo/db';
import { getQuestionPapers } from '../../server/db/queries/question-papers';
import { saveQuestionPaperAction } from '../../server/actions/question-papers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // 1. Get User ID (Cache this lookup ideally, but for now fast enough)
        const userRes = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        
        if (userRes.length === 0) {
            return NextResponse.json({ success: true, data: [] }); // No user = No papers
        }

        const userId = userRes[0]?.id;

        if (!userId) {
             return NextResponse.json({ success: true, data: [] });
        }

        // 2. Fetch Papers with details (Cached)
        const transformed = await getQuestionPapers(userId);

        return NextResponse.json({ success: true, data: transformed });

    } catch (error: any) {
        console.error('Fetch Papers Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await saveQuestionPaperAction(body);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, paperId: result.paperId });

    } catch (error: unknown) {
        console.error('Save Paper Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
