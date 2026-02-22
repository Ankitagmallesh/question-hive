import { db, questions, questionOptions, chapters } from '@repo/db';
import { sql } from 'drizzle-orm';

export interface CreateQuestionInput {
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

export const createQuestionMutation = async (input: CreateQuestionInput) => {
  // Validate chapter
  const [chapter] = await db
    .select({ subjectId: chapters.subjectId })
    .from(chapters)
    .where(sql`${chapters.id} = ${input.chapterId}`);

  if (!chapter) {
    throw new Error('Invalid chapter ID');
  }

  // Generate a new ID
  const [maxIdResult] = await db
    .select({ maxId: sql<number>`COALESCE(MAX(${questions.id}), 0)` })
    .from(questions);
  const newId = (maxIdResult?.maxId || 0) + 1;

  // Insert question
  await db.insert(questions).values({
    id: newId,
    content: input.content,
    chapterId: input.chapterId,
    subjectId: chapter.subjectId,
    difficultyLevelId: input.difficultyLevelId,
    questionTypeId: input.questionTypeId,
    marks: input.marks,
    correctAnswer: input.correctAnswer || '',
    explanation: input.explanation || null,
    createdBy: input.createdBy || 1,
    isActive: true,
    isAiGenerated: false,
  });

  // Insert options
  if (input.options && input.options.length > 0) {
    const [maxOptionIdResult] = await db
      .select({ maxId: sql<number>`COALESCE(MAX(${questionOptions.id}), 0)` })
      .from(questionOptions);
    let optionId = (maxOptionIdResult?.maxId || 0) + 1;

    for (let i = 0; i < input.options.length; i++) {
      const opt = input.options[i];
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

  return { id: newId };
};
