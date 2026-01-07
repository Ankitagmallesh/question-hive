import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { questionPapers, questionPaperItems, questionPaperStatuses, subjects, users, eq } from '@repo/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            id, // Optional: if updating existing
            settings, 
            paperQuestions,
            status = 'Saved' // Default to Saved
        } = body;

        // 1. Get User (Hardcoded to 1 for now, similar to dashboard stats)
        // In real auth, we'd extract from session
        const userRes = await db.select({ id: users.id }).from(users).limit(1);
        const userId = Number(userRes[0]?.id || 1);

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
                const itemsToInsert = paperQuestions.map((q: any, index: number) => ({
                    id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000000) + index, // Unique ID for item
                    questionPaperId: paperId,
                    questionId: Number(q.id), // Ensure question ID is number
                    orderIndex: index + 1,
                    marks: q.marks || 1 // Default marks if missing
                }));

                await tx.insert(questionPaperItems).values(itemsToInsert);
            }
            
            return paperId;
        });

        return NextResponse.json({ success: true, message: 'Paper saved successfully', paperId: resultId });

    } catch (error: any) {
        console.error('Save Paper Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
