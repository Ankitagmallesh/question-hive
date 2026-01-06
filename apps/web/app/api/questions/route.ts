import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { questions, difficultyLevels, questionTypes, eq } from '@repo/db';

export async function GET() {
  try {
    // Basic join to enrich question listing with difficulty & type names
    const data = await db
      .select({
        id: questions.id,
        content: questions.content,
        marks: questions.marks,
        difficultyLevelId: questions.difficultyLevelId,
        difficulty: difficultyLevels.name,
        questionType: questionTypes.name,
      })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
      .limit(100);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
