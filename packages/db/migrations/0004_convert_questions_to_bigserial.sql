-- Convert questions table to use bigserial auto-increment
-- This prevents ID collisions and simplifies ID generation

-- Step 1: Create a temporary new table with bigserial ID
CREATE TABLE questions_new (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  content TEXT NOT NULL,
  question_type_id BIGINT NOT NULL REFERENCES question_types(id),
  difficulty_level_id BIGINT NOT NULL REFERENCES difficulty_levels(id),
  marks BIGINT DEFAULT 1 NOT NULL,
  subject_id BIGINT NOT NULL REFERENCES subjects(id),
  chapter_id BIGINT NOT NULL REFERENCES chapters(id),
  explanation TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false NOT NULL,
  correct_answer TEXT NOT NULL
);

-- Step 2: Copy data from old table (IDs will be auto-generated, so we exclude id column)
INSERT INTO questions_new (
  created_at, updated_at, deleted_at, content, question_type_id,
  difficulty_level_id, marks, subject_id, chapter_id, explanation,
  created_by, is_active, is_ai_generated, correct_answer
)
SELECT 
  created_at, updated_at, deleted_at, content, question_type_id,
  difficulty_level_id, marks, subject_id, chapter_id, explanation,
  created_by, is_active, is_ai_generated, correct_answer
FROM questions
ORDER BY id;

-- Step 3: Update the sequence to match the highest new ID
SELECT setval(pg_get_serial_sequence('questions_new', 'id'), (SELECT MAX(id) FROM questions_new));

-- Step 4: Handle foreign keys - update question_paper_items to use new IDs
-- First, drop the foreign key constraint
ALTER TABLE question_paper_items DROP CONSTRAINT IF EXISTS question_paper_items_question_id_fkey;

-- Step 5: Create mapping from old IDs to new IDs and update references
WITH id_mapping AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY q.id) as row_num,
    q.id as old_id,
    qn.id as new_id
  FROM questions q
  JOIN questions_new qn ON 
    q.content = qn.content AND 
    q.question_type_id = qn.question_type_id AND
    q.difficulty_level_id = qn.difficulty_level_id AND
    q.marks = qn.marks AND
    q.subject_id = qn.subject_id AND
    q.chapter_id = qn.chapter_id AND
    q.created_by = qn.created_by
)
UPDATE question_paper_items qpi
SET question_id = im.new_id
FROM id_mapping im
WHERE qpi.question_id = im.old_id;

-- Similar updates for other tables that reference questions
UPDATE question_options qo
SET question_id = qn.id
FROM questions q
JOIN questions_new qn ON 
  q.content = qn.content AND 
  q.question_type_id = qn.question_type_id AND
  q.difficulty_level_id = qn.difficulty_level_id AND
  q.marks = qn.marks AND
  q.subject_id = qn.subject_id AND
  q.chapter_id = qn.chapter_id AND
  q.created_by = qn.created_by
WHERE qo.question_id = q.id;

UPDATE question_usage_log qul
SET question_id = qn.id
FROM questions q
JOIN questions_new qn ON 
  q.content = qn.content AND 
  q.question_type_id = qn.question_type_id AND
  q.difficulty_level_id = qn.difficulty_level_id AND
  q.marks = qn.marks AND
  q.subject_id = qn.subject_id AND
  q.chapter_id = qn.chapter_id AND
  q.created_by = qn.created_by
WHERE qul.question_id = q.id;

UPDATE question_statistics qs
SET question_id = qn.id
FROM questions q
JOIN questions_new qn ON 
  q.content = qn.content AND 
  q.question_type_id = qn.question_type_id AND
  q.difficulty_level_id = qn.difficulty_level_id AND
  q.marks = qn.marks AND
  q.subject_id = qn.subject_id AND
  q.chapter_id = qn.chapter_id AND
  q.created_by = qn.created_by
WHERE qs.question_id = q.id;

-- Step 6: Drop old table and rename new one
DROP TABLE questions;
ALTER TABLE questions_new RENAME TO questions;

-- Step 7: Recreate indices
CREATE INDEX questions_chapter_id_idx ON questions(chapter_id);
CREATE INDEX questions_subject_id_idx ON questions(subject_id);
CREATE INDEX questions_type_id_idx ON questions(question_type_id);
CREATE INDEX questions_difficulty_id_idx ON questions(difficulty_level_id);

-- Step 8: Re-add foreign key constraint
ALTER TABLE question_paper_items
ADD CONSTRAINT question_paper_items_question_id_fkey
FOREIGN KEY (question_id) REFERENCES questions(id);
