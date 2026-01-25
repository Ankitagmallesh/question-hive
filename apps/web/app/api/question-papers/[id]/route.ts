import { NextResponse } from 'next/server';
import { getQuestionPaperById } from '../../../server/db/queries/question-papers';
import { deleteQuestionPaperAction } from '../../../server/actions/question-papers';
import { db } from '../../../lib/db'; // Keep generic db access if needed for user lookup
import { users, eq } from '@repo/db';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const paperId = parseInt(params.id);
        
        if (isNaN(paperId)) {
            return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
        }

        const paper = await getQuestionPaperById(paperId);
        
        if (!paper) {
            return NextResponse.json({ success: false, error: 'Paper not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            paper
        });

    } catch (error: any) {
        console.error('Get Paper Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        const params = await props.params;
        const paperId = parseInt(params.id);

        if (!email) {
             return NextResponse.json({ success: false, error: 'Email required for auth check' }, { status: 401 });
        }
        
        if (isNaN(paperId)) {
            return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
        }

        // Resolve userId for cache invalidation
        const userRes = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        const userId = userRes.length > 0 ? userRes[0]!.id : 0;

        const result = await deleteQuestionPaperAction(paperId, userId);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: (result as any).error }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
