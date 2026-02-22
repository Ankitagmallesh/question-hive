import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/lib/db'; 
import { users } from '@repo/db';
import { eq } from 'drizzle-orm';
import { createQuestionMutation, CreateQuestionInput } from '../../../server/db/mutations/questions';
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Get DB User ID (Integer) from Email
        const [dbUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

        if (!dbUser) {
            return NextResponse.json({ success: false, error: 'User record not found' }, { status: 404 });
        }

        const body: CreateQuestionInput = await request.json();

        // Validate required fields
        if (!body.content || !body.chapterId || !body.difficultyLevelId || !body.questionTypeId || !body.marks) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields: content, chapterId, difficultyLevelId, questionTypeId, marks' 
            }, { status: 400 });
        }

        // Force the createdBy to be the authenticated user's ID
        const input = {
            ...body,
            createdBy: dbUser.id
        };

        const result = await createQuestionMutation(input);
        
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
