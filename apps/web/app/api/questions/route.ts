import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { questions, difficultyLevels, questionTypes } from '@repo/db';
import { eq, and, sql, desc, ilike } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search')?.trim() || searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type')?.trim() || '';
    const difficulty = searchParams.get('difficulty')?.trim() || '';

    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) conditions.push(ilike(questions.content, `%${search}%`));
    if (type) conditions.push(eq(questionTypes.name, type));
    if (difficulty) conditions.push(eq(difficultyLevels.name, difficulty));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Base Query for Data
    const baseQuery = db
      .select({
        id: questions.id,
        content: questions.content,
        marks: questions.marks,
        difficultyLevelId: questions.difficultyLevelId,
        difficulty: difficultyLevels.name,
        questionType: questionTypes.name,
        questionTypeId: questions.questionTypeId,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id));

    const queryWithFilters = whereClause ? baseQuery.where(whereClause) : baseQuery;

    // Count query with same filters
    const countBase = db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
      .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id));
    const countQuery = whereClause ? countBase.where(whereClause) : countBase;

    const [totalResult] = await countQuery;
    const total = Number(totalResult?.count || 0);

    // Execute Data Query with Pagination
    const data = await queryWithFilters
        .limit(limit)
        .offset(offset)
        .orderBy(desc(questions.createdAt));

    return NextResponse.json({ 
        success: true, 
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });

  } catch (e: unknown) {
    console.error('API Error:', e);
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
