import { 
  db, 
  questionPapers, 
  questionPaperItems, 
  users, 
  questionPaperStatuses, 
  questions, 
  questionOptions,
  chapters,
  subjects,
  difficultyLevels,
  questionTypes,
  eq, 
  inArray
} from '@repo/db';
import { sql } from 'drizzle-orm';

export interface SavePaperInput {
  id?: string | number;
  settings: any;
  paperQuestions: any[];
  status?: string;
  email: string;
  subjectId?: number; // Now required for proper categorization
}

export const createOrUpdateQuestionPaper = async (input: SavePaperInput) => {
  const { id, settings, paperQuestions, status = 'Saved', email, subjectId } = input;

  // Validate required fields
  if (!email) {
    throw new Error('Email is required');
  }

  if (!subjectId) {
    throw new Error('Subject ID is required for paper creation');
  }

  return await db.transaction(async (tx) => {
    // 1. Get or Create User
    let userId: number;
    const userRes = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    
    if (userRes.length > 0) {
      userId = userRes[0]?.id ?? 0;
      if (!userId) {
        throw new Error('Failed to retrieve user ID');
      }
    } else {
      // Create new user with database auto-increment ID
      const newUserRes = await tx.insert(users).values({
        email: email,
        name: email.split('@')[0] ?? 'User',
        passwordHash: 'supabase_auth',
        userRoleId: 1,
        isActive: true
      }).returning({ id: users.id });
      
      userId = newUserRes[0]?.id;
      if (!userId) {
        throw new Error('Failed to create new user');
      }
    }

    // 2. Resolve Status ID
    const statusRes = await tx.select({ id: questionPaperStatuses.id }).from(questionPaperStatuses).where(eq(questionPaperStatuses.name, status)).limit(1);
    const statusId = statusRes[0]?.id;
    
    if (!statusId) {
      throw new Error(`Invalid status: ${status}`);
    }

    // 3. Create or Update Paper
    let paperId: number;
    const paperData = {
      title: settings.title || 'Untitled Paper',
      description: settings.description || '',
      subjectId: subjectId, // Use provided subject ID, no fallback
      totalMarks: Number(settings.totalMarks) || 100,
      durationMinutes: Number(settings.duration) || 180,
      statusId: statusId,
      instructions: JSON.stringify(settings), // Store full settings
      updatedAt: new Date(),
      createdBy: userId
    };

    if (id) {
      paperId = Number(id);
      await tx.update(questionPapers).set(paperData).where(eq(questionPapers.id, paperId));
      // Clear existing items to rewrite them (simple sync strategy)
      await tx.delete(questionPaperItems).where(eq(questionPaperItems.questionPaperId, paperId));
    } else {
      // Let the DB handle ID generation (sequential)
      const inserted = await tx.insert(questionPapers).values({
        ...paperData,
        createdAt: new Date()
      }).returning({ id: questionPapers.id });
      
      paperId = inserted[0]?.id;
      if (!paperId) {
        throw new Error('Failed to create question paper');
      }
    }

    // 4. Insert Items
    if (paperQuestions && paperQuestions.length > 0) {
      
      // A. Handle New AI Questions (Non-numeric IDs or explicitly marked)
      const newQuestions = paperQuestions.filter((q: any) => 
          isNaN(Number(q.id)) || 
          q.isAiGenerated === true || 
          (typeof q.id === 'string' && q.id.startsWith('ai_'))
      );
      
      if (newQuestions.length > 0) {
          // Fetch Metadata for Mapping
          const [allDiffs, allTypes, allChapters] = await Promise.all([
              tx.select().from(difficultyLevels),
              tx.select().from(questionTypes),
              tx.select().from(chapters)
          ]);

          // Create Maps (Lowercase keys for fuzzy matching)
          const diffMap = new Map(allDiffs.map(d => [d.name.toLowerCase(), d.id]));
          const typeMap = new Map(allTypes.map(t => [t.name.toLowerCase(), t.id]));
          const chapterMap = new Map(allChapters.map(c => [c.name.toLowerCase(), c.id]));

          // Default Fallbacks
          const defaultDiffId = diffMap.get('medium') || allDiffs[0]?.id || 1;
          const defaultTypeId = typeMap.get('multiple choice') || allTypes[0]?.id || 1;
          const defaultChapterId = allChapters[0]?.id || 1;

          // Insert New Questions - let database handle ID generation
          for (const q of newQuestions) {
              try {
                  // Resolve Foreign Keys
                  const diffId = diffMap.get(q.difficulty?.toLowerCase()) || defaultDiffId;
                  
                  // AI often returns "multiple-choice" or "Multiple Choice". fuzzy match
                  let typeId = defaultTypeId;
                  if (q.type) {
                      const t = q.type.toLowerCase();
                      for (const [name, id] of typeMap.entries()) {
                          if (name.includes(t) || t.includes(name)) {
                              typeId = id;
                              break;
                          }
                      }
                  }

                  const chapId = q.chapter ? (chapterMap.get(q.chapter.toLowerCase()) || defaultChapterId) : defaultChapterId;

                  // Insert Question - database will auto-generate ID
                  const questionRes = await tx.insert(questions).values({
                      content: q.text,
                      questionTypeId: typeId,
                      difficultyLevelId: diffId,
                      marks: Number(q.marks) || 1,
                      subjectId: subjectId, // Use paper's subject
                      chapterId: chapId,
                      createdBy: userId,
                      isAiGenerated: true,
                      isActive: true,
                      correctAnswer: q.correctAnswer || ''
                  }).returning({ id: questions.id });

                  const generatedQId = questionRes[0]?.id;
                  if (!generatedQId) {
                      throw new Error('Failed to generate question ID');
                  }

                  // Insert Options
                  if (q.options && q.options.length > 0) {
                      const optionsToInsert = q.options.map((opt: any, idx: number) => ({
                          questionId: generatedQId,
                          optionText: opt.text,
                          optionOrder: idx + 1,
                          isCorrect: opt.isCorrect || false
                      }));
                      
                      await tx.insert(questionOptions).values(optionsToInsert);
                  }

                  // Update the local ID so paper items can reference it
                  q.id = generatedQId; 
              } catch (err) {
                  console.error("Failed to insert AI question:", err, q);
                  // Continue to next question, don't fail whole paper
              }
          }
      }

      // B. Insert into Paper Items (Now all should have numeric IDs)
      const itemsToInsert = paperQuestions
        .map((q: any, idx: number) => {
          const questionId = Number(q.id);
          if (isNaN(questionId)) {
            console.warn(`Skipping question with invalid ID: ${q.id}`);
            return null;
          }
          return {
            questionPaperId: paperId,
            questionId: questionId,
            orderIndex: idx + 1,
            marks: Number(q.marks) || 1
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (itemsToInsert.length > 0) {
        await tx.insert(questionPaperItems).values(itemsToInsert);
      }
    }

    return { success: true, paperId, userId };
  });
};

export const deleteQuestionPaperMutation = async (paperId: number) => {
  // Items cascade delete usually, but let's be safe if no FK cascade
  await db.delete(questionPaperItems).where(eq(questionPaperItems.questionPaperId, paperId));
  await db.delete(questionPapers).where(eq(questionPapers.id, paperId));
  return { success: true };
};
