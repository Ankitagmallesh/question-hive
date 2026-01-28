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
}

export const createOrUpdateQuestionPaper = async (input: SavePaperInput) => {
  const { id, settings, paperQuestions, status = 'Saved', email } = input;

  return await db.transaction(async (tx) => {
    // 1. Get or Create User
    let userId: number;
    const userRes = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    
    if (userRes.length > 0) {
      userId = userRes[0].id;
    } else {
      const newUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      await tx.insert(users).values({
        id: newUserId,
        email: email,
        name: email.split('@')[0],
        passwordHash: 'supabase_auth',
        userRoleId: 1,
        isActive: true
      });
      userId = newUserId;
    }

    // 2. Resolve Status ID
    const statusRes = await tx.select({ id: questionPaperStatuses.id }).from(questionPaperStatuses).where(eq(questionPaperStatuses.name, status)).limit(1);
    const statusId = statusRes.length > 0 ? statusRes[0].id : 1; // Default to 1 (Saved)

    // 3. Create or Update Paper
    let paperId: number;
    const paperData = {
      title: settings.title || 'Untitled Paper',
      description: settings.description || '',
      subjectId: settings.subjectId || 1, // Default to Math if missing
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
      
      paperId = inserted[0].id;
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
              tx.select().from(chapters) // Fetch all for now to be safe, or filter
          ]);

          // Create Maps (Lowercase keys for fuzzy matching)
          const diffMap = new Map(allDiffs.map(d => [d.name.toLowerCase(), d.id]));
          const typeMap = new Map(allTypes.map(t => [t.name.toLowerCase(), t.id]));
          const chapterMap = new Map(allChapters.map(c => [c.name.toLowerCase(), c.id]));

          // Default Fallbacks
          const defaultDiffId = diffMap.get('medium') || allDiffs[0]?.id || 1;
          const defaultTypeId = typeMap.get('multiple choice') || allTypes[0]?.id || 1;
          const defaultChapterId = allChapters[0]?.id || 1; // Fallback if no chapter matches

          // Use timestamp-based IDs to avoid race conditions and collisions
          // Date.now() * 1000 gives us microsecond-level precision and fits within MAX_SAFE_INTEGER
          let nextQuestionId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
          let nextOptionId = nextQuestionId + 100000; // Offset for options

          // Insert New Questions
          for (const q of newQuestions) {
              try {
                  // Resolve Foreign Keys
                  const diffId = diffMap.get(q.difficulty?.toLowerCase()) || defaultDiffId;
                  
                  // AI often returns "multiple-choice" or "Multiple Choice". fuzzy match?
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

                  // Insert Question with Manual ID
                  const currentQId = nextQuestionId++;
                  await tx.insert(questions).values({
                      id: currentQId,
                      content: q.text,
                      questionTypeId: typeId,
                      difficultyLevelId: diffId,
                      marks: Number(q.marks) || 1,
                      subjectId: settings.subjectId || 1, // Use paper subject
                      chapterId: chapId,
                      createdBy: userId,
                      isAiGenerated: true,
                      isActive: true,
                      correctAnswer: '' // AI doesn't always provide this, handled in options
                  });

                  // Insert Options with Manual IDs
                  if (q.options && q.options.length > 0) {
                      for (let idx = 0; idx < q.options.length; idx++) {
                          const opt = q.options[idx];
                          await tx.insert(questionOptions).values({
                              id: nextOptionId++,
                              questionId: currentQId,
                              optionText: opt.text,
                              optionOrder: idx + 1,
                              isCorrect: false // AI needs to provide this field if supported
                          });
                      }
                  }

                  // UPDATE the local ID so the next step picks it up
                  q.id = currentQId; 
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
