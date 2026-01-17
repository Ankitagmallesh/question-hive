import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questions, questionOptions, subjects, chapters } from '@repo/db';
import { sql } from 'drizzle-orm';

interface CreateQuestionRequest {
    content: string;
    chapterId: number;
    difficultyLevelId: number;
    questionTypeId: number;
    marks: number;
    correctAnswer: string;
    explanation?: string;
    options?: { text: string; isCorrect: boolean }[];
    createdBy: number;
}

export async function POST(request: Request) {
    try {
        const body: CreateQuestionRequest = await request.json();

        // Validate required fields
        if (!body.content || !body.chapterId || !body.difficultyLevelId || !body.questionTypeId || !body.marks) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields: content, chapterId, difficultyLevelId, questionTypeId, marks' 
            }, { status: 400 });
        }

        // Get subject from chapter
        const [chapter] = await db.select({ subjectId: chapters.subjectId }).from(chapters).where(sql`${chapters.id} = ${body.chapterId}`);
        if (!chapter) {
            return NextResponse.json({ success: false, error: 'Invalid chapter ID' }, { status: 400 });
        }

        // Generate a new ID (since schema uses bigint primary key without autoincrement)
        const [maxIdResult] = await db.select({ maxId: sql<number>`COALESCE(MAX(${questions.id}), 0)` }).from(questions);
        const newId = (maxIdResult?.maxId || 0) + 1;

        // Insert the question
        await db.insert(questions).values({
            id: newId,
            content: body.content,
            chapterId: body.chapterId,
            subjectId: chapter.subjectId,
            difficultyLevelId: body.difficultyLevelId,
            questionTypeId: body.questionTypeId,
            marks: body.marks,
            correctAnswer: body.correctAnswer || '',
            explanation: body.explanation || null,
            createdBy: body.createdBy || 1, // Default to user 1 if not provided
            isActive: true,
            isAiGenerated: false,
        });

        // Insert options if provided (for MCQ questions)
        if (body.options && body.options.length > 0) {
            const [maxOptionIdResult] = await db.select({ maxId: sql<number>`COALESCE(MAX(${questionOptions.id}), 0)` }).from(questionOptions);
            let optionId = (maxOptionIdResult?.maxId || 0) + 1;

            for (let i = 0; i < body.options.length; i++) {
                const opt = body.options[i];
                if (!opt) continue;
                await db.insert(questionOptions).values({
                    id: optionId++,
                    questionId: newId,
                    optionText: opt.text,
                    optionOrder: i + 1,
                    isCorrect: opt.isCorrect,
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            data: { id: newId },
            message: 'Question created successfully' 
        });

    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create question: ' + (error instanceof Error ? error.message : 'Unknown error') 
        }, { status: 500 });
    }
}
