
import { db } from '../app/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Fixing DB Schema and Data...');

  try {
    // 1. Ensure Exam ID 1 exists
    console.log('Ensuring default Exam...');
    await db.execute(sql`
      INSERT INTO exams (id, name, code, description, is_active)
      VALUES (1, 'General Exam', 'GEN', 'Default General Exam', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Ensure Subject ID 1 exists
    console.log('Ensuring default Subject...');
    await db.execute(sql`
      INSERT INTO subjects (id, name, code, description, exam_id, is_active)
      VALUES (1, 'General Subject', 'GEN', 'Default General Subject', 1, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Convert question_papers.id to Auto-Increment (Sequence)
    console.log('Converting question_papers.id to sequential...');
    await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS question_papers_id_seq;`);
    await db.execute(sql`
      ALTER TABLE question_papers 
      ALTER COLUMN id SET DEFAULT nextval('question_papers_id_seq');
    `);
    await db.execute(sql`
      ALTER SEQUENCE question_papers_id_seq OWNED BY question_papers.id;
    `);
    await db.execute(sql`
      SELECT setval('question_papers_id_seq', COALESCE((SELECT MAX(id) FROM question_papers), 0) + 1);
    `);

    // 4. Convert question_paper_items.id to Auto-Increment (Sequence)
    console.log('Converting question_paper_items.id to sequential...');
    await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS question_paper_items_id_seq;`);
    await db.execute(sql`
      ALTER TABLE question_paper_items 
      ALTER COLUMN id SET DEFAULT nextval('question_paper_items_id_seq');
    `);
    await db.execute(sql`
      ALTER SEQUENCE question_paper_items_id_seq OWNED BY question_paper_items.id;
    `);
    await db.execute(sql`
      SELECT setval('question_paper_items_id_seq', COALESCE((SELECT MAX(id) FROM question_paper_items), 0) + 1);
    `);

    console.log('Schema and Data fixed successfully!');

  } catch (error) {
    console.error('Error fixing DB:', error);
  }

  process.exit(0);
}

main();
