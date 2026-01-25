import { NextResponse } from 'next/server';
import { createQuestionMutation, CreateQuestionInput } from '../../../server/db/mutations/questions';
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body: CreateQuestionInput = await request.json();

        // Validate required fields
        if (!body.content || !body.chapterId || !body.difficultyLevelId || !body.questionTypeId || !body.marks) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields: content, chapterId, difficultyLevelId, questionTypeId, marks' 
            }, { status: 400 });
        }

        const result = await createQuestionMutation(body);
        
        // Invalidate cache
        revalidateTag('questions');

        return NextResponse.json({ 
            success: true, 
            data: result,
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
