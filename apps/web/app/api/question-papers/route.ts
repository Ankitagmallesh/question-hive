import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, eq } from '@repo/db';
import { getQuestionPapers } from '@/server/db/queries/question-papers';
import { saveQuestionPaperAction } from '@/server/actions/question-papers';
import { SavePaperInputSchema, validateInput } from '@/lib/validators';

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
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to fetch papers' 
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Validate input
        const validation = validateInput(SavePaperInputSchema, body);
        if (!validation.success) {
            return NextResponse.json({ 
                success: false, 
                error: `Validation error: ${validation.error}` 
            }, { status: 400 });
        }

        const result = await saveQuestionPaperAction(validation.data);
        
        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: result.error || 'Failed to save paper' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            paperId: result.paperId 
        });

    } catch (error: any) {
        console.error('Save Paper Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to save paper' 
        }, { status: 500 });
    }
}
