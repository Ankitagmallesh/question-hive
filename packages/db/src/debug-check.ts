
// @ts-nocheck
import { db, exams, subjects, eq } from './index';

async function main() {
  console.log('--- EXAMS ---');
  const allExams = await db.select().from(exams);
  console.log(allExams.map(e => ({ id: e.id, name: e.name })));

  console.log('--- SUBJECTS ---');
  const allSubjects = await db.select().from(subjects);
  console.log(allSubjects.map(s => ({ id: s.id, name: s.name, examId: s.examId })));

  console.log('--- JOIN CHECK for JEE Main ---');
  const jee = allExams.find(e => e.name === 'JEE Main');
  if (jee) {
    const jeeSubjects = allSubjects.filter(s => s.examId === jee.id);
    console.log(`Subjects for JEE Main (ID: ${jee.id}):`, jeeSubjects);
  } else {
    console.log('JEE Main exam not found!');
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
