
import { db } from '../app/lib/db';
import { questionOptions } from '@repo/db';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Checking Question Options...');
  
  // 1. Get total count
  const allOptions = await db.select().from(questionOptions);
  console.log(`Total options found: ${allOptions.length}`);

  // 2. Get samples of correct options
  const correctOptions = await db.select().from(questionOptions).where(eq(questionOptions.isCorrect, true)).limit(5);
  console.log('\nSample Correct Options (limit 5):');
  console.log(JSON.stringify(correctOptions, null, 2));

  // 3. Get samples of incorrect options
   const incorrectOptions = await db.select().from(questionOptions).where(eq(questionOptions.isCorrect, false)).limit(5);
  console.log('\nSample Incorrect Options (limit 5):');
  console.log(JSON.stringify(incorrectOptions, null, 2));
  
  // 4. Check specific question options (if any ID known, otherwise just pick one from above)
  if (correctOptions.length > 0) {
      const qId = correctOptions[0].questionId;
      console.log(`\nOptions for Question ID ${qId}:`);
      const qOptions = await db.select().from(questionOptions).where(eq(questionOptions.questionId, qId));
      console.log(JSON.stringify(qOptions, null, 2));
  }

  process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
