import { pgTable, bigint, text, boolean, timestamp, integer, numeric, uniqueIndex } from 'drizzle-orm/pg-core';

// Lookup / reference tables
export const difficultyLevels = pgTable('difficulty_levels', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  name: text('name').notNull(),
  levelOrder: integer('level_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  difficultyLevelsNameUnique: uniqueIndex('difficulty_levels_name_key').on(t.name),
  difficultyLevelsOrderUnique: uniqueIndex('difficulty_levels_level_order_key').on(t.levelOrder),
}));

export const questionTypes = pgTable('question_types', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  requiresOptions: boolean('requires_options').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  questionTypesNameUnique: uniqueIndex('question_types_name_key').on(t.name),
  questionTypesCodeUnique: uniqueIndex('question_types_code_key').on(t.code),
}));

export const userRoles = pgTable('user_roles', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  userRolesNameUnique: uniqueIndex('user_roles_name_key').on(t.name),
  userRolesCodeUnique: uniqueIndex('user_roles_code_key').on(t.code),
}));

export const institutionTypes = pgTable('institution_types', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  institutionTypesNameUnique: uniqueIndex('institution_types_name_key').on(t.name),
  institutionTypesCodeUnique: uniqueIndex('institution_types_code_key').on(t.code),
}));

export const questionPaperStatuses = pgTable('question_paper_statuses', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  questionPaperStatusesNameUnique: uniqueIndex('question_paper_statuses_name_key').on(t.name),
  questionPaperStatusesCodeUnique: uniqueIndex('question_paper_statuses_code_key').on(t.code),
}));

// Core entity tables
export const institutions = pgTable('institutions', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  institutionTypeId: bigint('institution_type_id', { mode: 'number' }).notNull().references(() => institutionTypes.id),
  isActive: boolean('is_active').default(true).notNull(),
}, (t) => ({
  institutionsCodeUnique: uniqueIndex('institutions_code_key').on(t.code),
}));

export const institutionContacts = pgTable('institution_contacts', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  institutionId: bigint('institution_id', { mode: 'number' }).notNull().references(() => institutions.id),
  contactType: text('contact_type').notNull(),
  contactValue: text('contact_value').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const institutionAddresses = pgTable('institution_addresses', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  institutionId: bigint('institution_id', { mode: 'number' }).notNull().references(() => institutions.id),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code'),
  country: text('country').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  userRoleId: bigint('user_role_id', { mode: 'number' }).notNull().references(() => userRoles.id),
  institutionId: bigint('institution_id', { mode: 'number' }).references(() => institutions.id),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
}, (t) => ({
  usersEmailUnique: uniqueIndex('users_email_key').on(t.email),
}));

export const exams = pgTable('exams', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
}, (t) => ({
  examsCodeUnique: uniqueIndex('exams_code_key').on(t.code),
}));

export const subjects = pgTable('subjects', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  examId: bigint('exam_id', { mode: 'number' }).notNull().references(() => exams.id),
  isActive: boolean('is_active').default(true).notNull(),
});

export const chapters = pgTable('chapters', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  subjectId: bigint('subject_id', { mode: 'number' }).notNull().references(() => subjects.id),
  isActive: boolean('is_active').default(true).notNull(),
});

export const chapterWeightages = pgTable('chapter_weightages', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  chapterId: bigint('chapter_id', { mode: 'number' }).notNull().references(() => chapters.id),
  institutionId: bigint('institution_id', { mode: 'number' }).references(() => institutions.id),
  academicYear: text('academic_year'),
  // numeric in SQL; represent as text then cast or use numeric
  weightage: numeric('weightage').default('1').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const questions = pgTable('questions', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  content: text('content').notNull(),
  questionTypeId: bigint('question_type_id', { mode: 'number' }).notNull().references(() => questionTypes.id),
  difficultyLevelId: bigint('difficulty_level_id', { mode: 'number' }).notNull().references(() => difficultyLevels.id),
  marks: bigint('marks', { mode: 'number' }).default(1).notNull(),
  subjectId: bigint('subject_id', { mode: 'number' }).notNull().references(() => subjects.id),
  chapterId: bigint('chapter_id', { mode: 'number' }).notNull().references(() => chapters.id),
  explanation: text('explanation'),
  createdBy: bigint('created_by', { mode: 'number' }).notNull().references(() => users.id),
  isActive: boolean('is_active').default(true).notNull(),
  isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
  correctAnswer: text('correct_answer').notNull(),
});

export const questionOptions = pgTable('question_options', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  questionId: bigint('question_id', { mode: 'number' }).notNull().references(() => questions.id),
  optionText: text('option_text').notNull(),
  optionOrder: integer('option_order').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const questionPapers = pgTable('question_papers', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  title: text('title').notNull(),
  description: text('description'),
  examDate: timestamp('exam_date', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
  totalMarks: bigint('total_marks', { mode: 'number' }).default(0).notNull(),
  instructions: text('instructions'),
  subjectId: bigint('subject_id', { mode: 'number' }).notNull().references(() => subjects.id),
  createdBy: bigint('created_by', { mode: 'number' }).notNull().references(() => users.id),
  statusId: bigint('status_id', { mode: 'number' }).notNull().references(() => questionPaperStatuses.id),
  isActive: boolean('is_active').default(true).notNull(),
});

export const questionPaperItems = pgTable('question_paper_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  questionPaperId: bigint('question_paper_id', { mode: 'number' }).notNull().references(() => questionPapers.id),
  questionId: bigint('question_id', { mode: 'number' }).notNull().references(() => questions.id),
  orderIndex: integer('order_index').notNull(),
  marks: bigint('marks', { mode: 'number' }).notNull(),
});

export const questionUsageLog = pgTable('question_usage_log', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  questionId: bigint('question_id', { mode: 'number' }).notNull().references(() => questions.id),
  questionPaperId: bigint('question_paper_id', { mode: 'number' }).notNull().references(() => questionPapers.id),
  usedBy: bigint('used_by', { mode: 'number' }).notNull().references(() => users.id),
  usedAt: timestamp('used_at', { withTimezone: true }).defaultNow(),
  marksAssigned: bigint('marks_assigned', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const questionStatistics = pgTable('question_statistics', {
  questionId: bigint('question_id', { mode: 'number' }).primaryKey().notNull().references(() => questions.id),
  usageCount: bigint('usage_count', { mode: 'number' }).default(0).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  averageMarks: numeric('average_marks'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  bio: text('bio'),
  phone: text('phone'),
  address: text('address'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  profilesUserIdUnique: uniqueIndex('profiles_user_id_key').on(t.userId),
}));

