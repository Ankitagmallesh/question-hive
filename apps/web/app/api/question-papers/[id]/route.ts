import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questionPapers, questionPaperItems, questions, questionOptions, difficultyLevels, questionTypes, chapters, eq, asc } from '@repo/db';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const paperId = parseInt(params.id);
        
        if (isNaN(paperId)) {
            return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
        }

        // 1. Fetch Paper Metadata
        const paperRes = await db.select().from(questionPapers).where(eq(questionPapers.id, paperId));
        
        if (paperRes.length === 0) {
            return NextResponse.json({ success: false, error: 'Paper not found' }, { status: 404 });
        }

        const paper = paperRes[0];
        let settings: any = {};
        try {
            const parsed = typeof paper.instructions === 'string' ? JSON.parse(paper.instructions) : paper.instructions;
            settings = parsed && typeof parsed === 'object' ? parsed : {};
        } catch (e) {
            settings = {};
        }

        // Merge DB columns back into settings shape
        const fullSettings = {
            ...settings,
            title: paper.title || '',
            duration: String(paper.durationMinutes || 0),
            totalMarks: String(paper.totalMarks || 0)
        };

        // 2. Fetch Items (Questions) linked to this paper
        // We order by orderIndex to maintain sequence
        const items = await db.select({
                itemId: questionPaperItems.id,
                order: questionPaperItems.orderIndex,
                marks: questionPaperItems.marks,
                qId: questions.id,
                qText: questions.text,
                qType: questionTypes.name,
                qDiff: difficultyLevels.name,
                qChapter: chapters.name,
                qOptions: questions.options
            })
            .from(questionPaperItems)
            .innerJoin(questions, eq(questionPaperItems.questionId, questions.id))
            .leftJoin(difficultyLevels, eq(questions.difficultyId, difficultyLevels.id))
            .leftJoin(questionTypes, eq(questions.typeId, questionTypes.id))
            .leftJoin(chapters, eq(questions.subjectId, chapters.subjectId)) // This is weak linking, ideal is questions.topicId -> topics -> chapters. 
            // But for now, let's rely on what we have. If `questions.options` is JSON, we can use it.
            // Actually, we inserted options as JSON string in the POST.
            .where(eq(questionPaperItems.questionPaperId, paperId))
            .orderBy(asc(questionPaperItems.orderIndex)); 
            
        // 3. Transform Questions
        const papersQuestions = items.map((item: any) => {
            let options = [];
            try {
                const parsedOpts = typeof item.qOptions === 'string' ? JSON.parse(item.qOptions) : item.qOptions;
                options = Array.isArray(parsedOpts) ? parsedOpts : [];
            } catch (e) {
                options = [];
            }

            return {
                id: String(item.qId),
                text: item.qText,
                type: item.qType,
                difficulty: item.qDiff?.toLowerCase() || 'medium',
                chapter: item.qChapter, // might be ambiguous if not strictly linked
                marks: item.marks,
                options: options
            };
        });

        return NextResponse.json({
            success: true,
            paper: {
                id: String(paper.id),
                settings: fullSettings,
                paperQuestions: papersQuestions,
                savedAt: paper.updatedAt
            }
        });

    } catch (error: any) {
        console.error('Get Paper Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

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
    } catch (error: any) {
        console.error('Delete Paper Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
