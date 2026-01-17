import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { exams, subjects, chapters, difficultyLevels, questionTypes } from '@repo/db';
import { eq } from 'drizzle-orm';

// GET: Fetch dropdown data (exams, subjects, chapters, difficulties, types)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataType = searchParams.get('type'); // 'exams', 'subjects', 'chapters', 'difficulties', 'questionTypes', 'all'
        const parentId = searchParams.get('parentId'); // For filtering subjects by exam or chapters by subject

        if (dataType === 'exams' || dataType === 'all') {
            const examsList = await db.select({ id: exams.id, name: exams.name, code: exams.code }).from(exams).where(eq(exams.isActive, true));
            if (dataType === 'exams') {
                return NextResponse.json({ success: true, data: examsList });
            }
        }

        if (dataType === 'subjects') {
            if (!parentId) {
                return NextResponse.json({ success: false, error: 'examId (parentId) is required for subjects' }, { status: 400 });
            }
            const subjectsList = await db.select({ id: subjects.id, name: subjects.name, code: subjects.code })
                .from(subjects)
                .where(eq(subjects.examId, parseInt(parentId)));
            return NextResponse.json({ success: true, data: subjectsList });
        }

        if (dataType === 'chapters') {
            if (!parentId) {
                return NextResponse.json({ success: false, error: 'subjectId (parentId) is required for chapters' }, { status: 400 });
            }
            const chaptersList = await db.select({ id: chapters.id, name: chapters.name, code: chapters.code })
                .from(chapters)
                .where(eq(chapters.subjectId, parseInt(parentId)));
            return NextResponse.json({ success: true, data: chaptersList });
        }

        if (dataType === 'difficulties' || dataType === 'all') {
            const difficultiesList = await db.select({ id: difficultyLevels.id, name: difficultyLevels.name }).from(difficultyLevels);
            if (dataType === 'difficulties') {
                return NextResponse.json({ success: true, data: difficultiesList });
            }
        }

        if (dataType === 'questionTypes' || dataType === 'all') {
            const typesList = await db.select({ id: questionTypes.id, name: questionTypes.name, code: questionTypes.code, requiresOptions: questionTypes.requiresOptions }).from(questionTypes);
            if (dataType === 'questionTypes') {
                return NextResponse.json({ success: true, data: typesList });
            }
        }

        // If 'all', return everything
        if (dataType === 'all') {
            const [examsList, difficultiesList, typesList] = await Promise.all([
                db.select({ id: exams.id, name: exams.name, code: exams.code }).from(exams).where(eq(exams.isActive, true)),
                db.select({ id: difficultyLevels.id, name: difficultyLevels.name }).from(difficultyLevels),
                db.select({ id: questionTypes.id, name: questionTypes.name, code: questionTypes.code, requiresOptions: questionTypes.requiresOptions }).from(questionTypes)
            ]);
            return NextResponse.json({
                success: true,
                data: {
                    exams: examsList,
                    difficulties: difficultiesList,
                    questionTypes: typesList
                }
            });
        }

        return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });

    } catch (error) {
        console.error('Error fetching dropdown data:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}
