// @ts-nocheck
import { db } from './client';
import { exams, subjects, chapters } from './schema';
import { eq, and } from 'drizzle-orm';

async function seed() {
  console.log('[seed] Starting seed');

  // --- 1. EXAMS ---
  const existingExams = await db.select().from(exams);
  // Only insert if completely empty, OR ensure specific exams exist?
  // User logic seemed to be "if empty, insert default set".
  // Better: Ensure "JEE Main", "NEET", "KCET" etc exist.
  
  const requiredExams = [
    { name: 'JEE Main', code: 'JEE_MAIN', description: 'Joint Entrance Examination', isActive: true },
    { name: 'NEET', code: 'NEET', description: 'Medical Entrance', isActive: true },
    { name: 'KCET', code: 'KCET', description: 'Karnataka CET', isActive: true },
    { name: '11th', code: 'CLASS11', description: '11th Grade', isActive: true },
    { name: '12th', code: 'CLASS12', description: '12th Grade', isActive: true },
  ];

  for (const e of requiredExams) {
      // Check by name or code to avoid duplicates if re-running
      // Simple check: Look for name. (Could be more robust with code)
      const found = existingExams.find(ex => ex.name === e.name || ex.name === 'JEE' && e.name === 'JEE Main'); // Handle simpler 'JEE' name case
      if (!found) {
          console.log(`[seed] Inserting exam: ${e.name}`);
          await db.insert(exams).values(e);
      }
  }

  // Refresh exam list
  const allExams = await db.select().from(exams);
  const findExamId = (name: string) => allExams.find(e => e.name === name || (name === 'JEE Main' && e.name === 'JEE'))?.id;

  // --- 2. SUBJECTS ---
  const subjectsToEnsure = [
      // JEE Main
      { exam: 'JEE Main', subjects: [
          { name: 'Physics', code: 'PHY', description: 'Physics' },
          { name: 'Chemistry', code: 'CHE', description: 'Chemistry' },
          { name: 'Mathematics', code: 'MAT', description: 'Mathematics' },
      ]},
      // NEET
      { exam: 'NEET', subjects: [
          { name: 'Physics', code: 'PHY', description: 'Physics' },
          { name: 'Chemistry', code: 'CHE', description: 'Chemistry' },
          { name: 'Biology', code: 'BIO', description: 'Biology' },
      ]},
      // KCET
      { exam: 'KCET', subjects: [
          { name: 'Physics', code: 'PHY', description: 'Physics' },
          { name: 'Chemistry', code: 'CHE', description: 'Chemistry' },
          { name: 'Mathematics', code: 'MAT', description: 'Mathematics' },
          { name: 'Biology', code: 'BIO', description: 'Biology' },
      ]}
  ];

  for (const group of subjectsToEnsure) {
      const examId = findExamId(group.exam);
      if (!examId) continue;

      for (const s of group.subjects) {
          // Check if subject exists for this exam
          const existing = await db.select().from(subjects).where(and(
              eq(subjects.name, s.name),
              eq(subjects.examId, examId)
          ));
          
          if (existing.length === 0) {
              console.log(`[seed] Inserting subject ${s.name} for ${group.exam}`);
              await db.insert(subjects).values({
                  ...s,
                  examId,
                  isActive: true
              });
          }
      }
  }

  // --- 3. CHAPTERS ---
  // Ensure basic chapters for all subjects
  const allSubjects = await db.select().from(subjects);
  
  for (const subject of allSubjects) {
      const neededChapters = [
          { name: `Basics of ${subject.name}`, code: `${subject.code}-01`, description: 'Intro' },
          { name: `Advanced ${subject.name}`, code: `${subject.code}-02`, description: 'Advanced' }
      ];

      for (const c of neededChapters) {
           const existing = await db.select().from(chapters).where(and(
               eq(chapters.name, c.name),
               eq(chapters.subjectId, subject.id)
           ));
           if (existing.length === 0) {
              console.log(`[seed] Inserting chapter ${c.name} for ${subject.name}`);
              await db.insert(chapters).values({
                  ...c,
                  subjectId: subject.id,
                  isActive: true
              });
           }
      }
  }

  console.log('[seed] Done');
}

seed().catch(err => {
  console.error('[seed] Error', err);
  process.exit(1);
});
