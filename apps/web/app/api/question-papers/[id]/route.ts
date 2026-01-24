import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questionPapers, questionPaperItems, eq } from '@repo/db';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const paperId = parseInt(params.id);
        
        if (isNaN(paperId)) {
            return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            // Delete items first (FK constraint)
            await tx.delete(questionPaperItems)
                .where(eq(questionPaperItems.questionPaperId, paperId));
            
            // Delete paper
            await tx.delete(questionPapers)
                .where(eq(questionPapers.id, paperId));
        });

        return NextResponse.json({ success: true, message: 'Question paper deleted successfully' });
    } catch (error: unknown) {
        console.error('Delete Paper Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
