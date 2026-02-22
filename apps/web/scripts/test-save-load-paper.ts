
import { db, questionPapers, questionPaperItems, questions, questionTypes, difficultyLevels, chapters, questionOptions, eq, sql, inArray, asc } from '@repo/db';

async function main() {
  // Use a random large ID or one that likely exists/doesn't exist. 
  const paperId = 1769169050; 
  console.log(`Testing fetching paper ${paperId}...`);

  try {
      // 2. Fetch Items (The problematic query)
      console.log('Fetching items...');
      const items = await db.select({
          itemId: questionPaperItems.id,
          order: questionPaperItems.orderIndex,
          marks: questionPaperItems.marks,
          qId: questions.id,
          qText: questions.content,
          qType: questionTypes.name,
          qDiff: difficultyLevels.name,
          qChapter: chapters.name,
        })
        .from(questionPaperItems)
        .innerJoin(questions, eq(questionPaperItems.questionId, questions.id))
        .leftJoin(difficultyLevels, eq(questions.difficultyLevelId, difficultyLevels.id))
        .leftJoin(questionTypes, eq(questions.questionTypeId, questionTypes.id))
        .leftJoin(chapters, eq(questions.chapterId, chapters.id))
        .where(eq(questionPaperItems.questionPaperId, paperId))
        .orderBy(asc(questionPaperItems.orderIndex));
      
      console.log(`Items fetched: ${items.length}`);
      
  } catch (error) {
      console.error('Error fetching paper:', error);
  }
}

main();
