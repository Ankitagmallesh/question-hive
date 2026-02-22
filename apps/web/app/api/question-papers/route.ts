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

        // 3. Resolve Subject ID (Assume first subject or map from settings if available)
        // For now, defaulting to first subject to prevent FK errors. 
        // TODO: Add Subject selection in Paper Designer
        const subjectRes = await db.select({ id: subjects.id }).from(subjects).limit(1);
        const subjectId = Number(subjectRes[0]?.id || 1);

        // 4. Transaction to Save Paper + Items
        // Validate ID: if it's not a number, treat as new (0)
        const numericId = !isNaN(Number(id)) ? Number(id) : 0;

        // Wrap transaction result to return paperId
        const resultId = await db.transaction(async (tx) => {
            // Check if exists
            const existing = await tx.select().from(questionPapers).where(eq(questionPapers.id, numericId));
            
            let paperId: number;
        // 1. Get User ID (Cache this lookup ideally, but for now fast enough)
        const userRes = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        
        if (userRes.length === 0) {
            return NextResponse.json({ success: true, data: [] }); // No user = No papers
        }

        const userId = userRes[0].id;

        // 2. Fetch Papers with details (Cached)
        const transformed = await getQuestionPapers(userId);

            // B. Insert Items
            if (paperQuestions.length > 0) {
                const itemsToInsert = paperQuestions.map((q: { id: string | number; marks?: number }, index: number) => ({
                    id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000) + index, // Unique ID for item
                    questionPaperId: paperId,
                    questionId: Number(q.id), // Ensure question ID is number
                    orderIndex: index + 1,
                    marks: q.marks || 1 // Default marks if missing
                }));
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
