import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { questionPapers, questionPaperItems, questionPaperStatuses, subjects, users, questions, eq, desc, sql } from '@repo/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // 1. Get User ID
        const userRes = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        
        if (userRes.length === 0) {
            return NextResponse.json({ success: true, daa: [] }); // No user = No papers
        }

        const userId = userRes[0].id;

        // 2. Fetch Papers with details
        // We need counts of questions, so we'll do a subquery or join-aggregates if possible, 
        // but for simplicity/speed in Drizzle without complex maps, we can fetch papers first then their counts or just basic metadata.
        // The Saved Papers UI shows: Title, Chapters Count, Questions Count, Difficulty, Saved Date.
        // We'll fetch the basic paper info and join status.
        
        const papers = await db.select({
            id: questionPapers.id,
            title: questionPapers.title,
            updatedAt: questionPapers.updatedAt,
            status: questionPaperStatuses.name,
            instructions: questionPapers.instructions, // Contains settings diff/chapters info
            questionsCount: sql<number>`(SELECT count(*) FROM ${questionPaperItems} WHERE ${questionPaperItems.questionPaperId} = ${questionPapers.id})`
        })
        .from(questionPapers)
        .leftJoin(questionPaperStatuses, eq(questionPapers.statusId, questionPaperStatuses.id))
        .where(eq(questionPapers.createdBy, userId))
        .orderBy(desc(questionPapers.updatedAt));

        // Transform results to match the 'SavedPaper' shape expected by frontend (approx)
        const transformed = papers.map(p => {
            let settings: any = {};
            try {
                settings = typeof p.instructions === 'string' ? JSON.parse(p.instructions) : p.instructions;
            } catch (e) {}

            return {
                id: String(p.id),
                savedAt: p.updatedAt,
                settings: {
                    title: p.title,
                    difficulty: settings.difficulty || 'mixed', // generic fallback
                    chapters: settings.template ? [] : [], // We don't store chapters specifically in a searchable way easily yet without parsing. 
                    // Actually, the frontend expects `settings.chapters` array. 
                    // In the POST, we saved: instructions: JSON.stringify({ ...settings })
                    // So we can extract it back.
                    ...settings
                },
                paperQuestions: Array(Number(p.questionsCount)).fill({}) // specific content not needed for list, just length
            };
        });

        return NextResponse.json({ success: true, data: transformed });

    } catch (error: any) {
        console.error('Fetch Papers Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            id, // Optional: if updating existing
            settings, 
            paperQuestions,
            status = 'Saved', // Default to Saved
            email // User email passed from frontend
        } = body;

        let userId = 1; // Default fallback

        if (email) {
            const userRes = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
            if (userRes.length > 0) {
                userId = userRes[0].id;
            } else {
                // User from Supabase Auth doesn't exist in local DB yet. Create them.
                const newUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
                await db.insert(users).values({
                    id: newUserId,
                    email: email,
                    name: email.split('@')[0], // Fallback name
                    userRoleId: 1, 
                    isActive: true
                });
                userId = newUserId;
                console.log(`[PaperAPI] Auto-created user ${email} with ID ${userId}`);
            }
        }

        // 2. Resolve Status ID (Auto-seed if missing)
        let statusRes = await db.select().from(questionPaperStatuses).where(eq(questionPaperStatuses.name, status));
        let statusId: number;

        if (statusRes.length === 0) {
            // Auto-create status with explicit ID since DB might not have auto-increment
            // Map common statuses to fixed IDs to avoid collisions/nulls
            const statusMap: Record<string, number> = {
                'Saved': 1,
                'Published': 2,
                'Draft': 3
            };
            const newId = statusMap[status] || Math.floor(Math.random() * 10000) + 10;

            // Check if ID exists to be safe
            const idCheck = await db.select().from(questionPaperStatuses).where(eq(questionPaperStatuses.id, newId));
            if (idCheck.length > 0) {
                 // Fallback if ID taken (shouldn't happen on empty DB)
                 statusId = idCheck[0].id;
            } else {
                await db.insert(questionPaperStatuses).values({
                    id: newId,
                    name: status,
                    code: status.toUpperCase(),
                    description: `Automatically created status for ${status}`
                });
                statusId = newId;
            }
        } else {
            statusId = statusRes[0].id;
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
        const resultId = await db.transaction(async (tx: any) => {
            // Check if exists
            const existing = await tx.select().from(questionPapers).where(eq(questionPapers.id, numericId));
            
            let paperId: number;

            if (existing.length > 0) {
                paperId = existing[0].id;
                await tx.update(questionPapers).set({
                    title: settings.title,
                    description: `Paper for ${settings.institution || 'School'}`,
                    durationMinutes: parseInt(settings.duration) || 0,
                    totalMarks: parseInt(settings.totalMarks) || 0,
                    statusId: statusId,
                    subjectId: subjectId,
                    updatedAt: new Date(),
                    instructions: JSON.stringify({
                        font: settings.font,
                        template: settings.template,
                        margin: settings.margin,
                        fontSize: settings.fontSize,
                        institution: settings.institution
                    })
                }).where(eq(questionPapers.id, paperId));

                // Clear existing items to re-insert
                await tx.delete(questionPaperItems).where(eq(questionPaperItems.questionPaperId, paperId));
            } else {
                // Insert New
                const newPaperId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000); // Simple numeric ID generation
                await tx.insert(questionPapers).values({
                    id: newPaperId,
                    title: settings.title,
                    description: `Paper for ${settings.institution || 'School'}`,
                    durationMinutes: parseInt(settings.duration) || 0,
                    totalMarks: parseInt(settings.totalMarks) || 0,
                    statusId: statusId,
                    subjectId: subjectId,
                    createdBy: userId,
                    instructions: JSON.stringify({
                        font: settings.font,
                        template: settings.template,
                        margin: settings.margin,
                        fontSize: settings.fontSize,
                        institution: settings.institution
                    })
                });
                paperId = newPaperId;
            }

            // B. Insert Items
            if (paperQuestions.length > 0) {
                const itemsToInsert = [];
                
                for (let i = 0; i < paperQuestions.length; i++) {
                    const q = paperQuestions[i];
                    let finalQId = Number(q.id);

                    // If ID is not a number (e.g. AI generated UUID), create the question first
                    if (isNaN(finalQId)) {
                        const newQId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000) + i;
                        // Insert new question
                        // Ideally we should import `questions` schema but for now using raw insert or assuming table structure
                        // Using explicit any to bypass checking for now as we need to fix the runtime error
                         await tx.insert(questions).values({
                            id: newQId,
                            text: q.text,
                            typeId: 1, // Defaulting to MCQ (1) - needing lookup normally
                            difficultyId: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3, // Maps to 1,2,3
                            subjectId: subjectId,
                            topicId: 1, // Fallback
                            createdBy: userId,
                            options: q.options ? JSON.stringify(q.options) : '[]'
                        });
                        finalQId = newQId;
                    }

                    itemsToInsert.push({
                        id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000) + i + 100,
                        questionPaperId: paperId,
                        questionId: finalQId,
                        orderIndex: i + 1,
                        marks: q.marks || 1
                    });
                }

                if (itemsToInsert.length > 0) {
                    await tx.insert(questionPaperItems).values(itemsToInsert);
                }
            }
            
            return paperId;
        });

        return NextResponse.json({ success: true, message: 'Paper saved successfully', paperId: resultId });

    } catch (error: any) {
        console.error('Save Paper Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
