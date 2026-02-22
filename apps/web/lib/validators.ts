import { z } from 'zod';

/**
 * Validation schemas for Question Hive APIs
 * Ensures type safety and runtime validation for all request inputs
 */

// --- Question Paper Schemas ---

export const SavePaperInputSchema = z.object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
  settings: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().default(''),
    duration: z.union([z.string(), z.number()]).optional(),
    totalMarks: z.union([z.string(), z.number()]).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    template: z.string().optional(),
    // Additional paper settings
    institution: z.string().optional(),
    logo: z.string().optional().nullable(),
    logoPosition: z.enum(['left', 'center', 'right']).optional(),
    font: z.string().optional(),
    fontSize: z.number().positive().optional(),
    layout: z.enum(['single', 'double']).optional(),
    margin: z.string().optional(),
    lineHeight: z.number().positive().optional(),
    answerSpace: z.enum(['none', 'lines', 'box']).optional(),
    separator: z.enum(['none', 'solid', 'double', 'dashed']).optional(),
    pageBorder: z.enum(['none', 'border-simple', 'border-double']).optional(),
    // PDF/Paper rendering settings
    metaFontSize: z.number().positive().optional(),
    date: z.string().optional(),
    instructions: z.string().optional(),
    watermark: z.string().optional(),
    studentName: z.boolean().optional(),
    rollNumber: z.boolean().optional(),
    classSection: z.boolean().optional(),
    dateField: z.boolean().optional(),
    invigilatorSign: z.boolean().optional(),
    footerText: z.string().optional(),
    roughWorkArea: z.enum(['none', 'right']).optional(),
    pageNumbering: z.enum(['hidden', 'page-x-of-y', 'x-slash-y']).optional(),
    studentDetailsGap: z.number().optional(),
    contentAlignment: z.enum(['left', 'center', 'justify']).optional(),
    chapters: z.array(z.union([z.string(), z.number()])).optional(),
  }).passthrough(), // Changed from .strict() to allow additional fields
  paperQuestions: z.array(z.object({
    id: z.union([z.string(), z.number()]).optional(),
    text: z.string().min(1),
    type: z.string().optional(),
    difficulty: z.string().optional(),
    chapter: z.string().optional(),
    marks: z.union([z.string(), z.number()]).optional(),
    options: z.array(z.object({
      text: z.string().min(1),
      isCorrect: z.boolean().optional(),
    })).optional(),
    isAiGenerated: z.boolean().optional(),
    correctAnswer: z.string().optional(),
  })),
  status: z.string().optional().default('Saved'),
  email: z.string().email('Invalid email address'),
  subjectId: z.number().positive('Subject ID must be a positive number'),
});

export type SavePaperInput = z.infer<typeof SavePaperInputSchema>;

// --- PDF Export Schemas ---

export const ExportPdfRequestSchema = z.object({
  data: z.object({
    title: z.string().min(1).max(200),
    questions: z.array(z.object({
      id: z.string().optional(),
      text: z.string().min(1),
      marks: z.number().optional(),
      options: z.array(z.object({
        text: z.string(),
        correct: z.boolean().optional(),
      })).optional(),
    })),
    institution: z.string().optional(),
    duration: z.string().optional(),
    totalMarks: z.string().optional(),
    font: z.string().optional(),
    fontSize: z.number().positive().optional(),
    margin: z.string().optional(),
    template: z.string().optional(),
    logo: z.string().url().optional().nullable(),
    logoPosition: z.enum(['left', 'center', 'right']).optional(),
    layout: z.enum(['single', 'double']).optional(),
    lineHeight: z.number().positive().optional(),
    answerSpace: z.enum(['none', 'lines', 'box']).optional(),
    separator: z.enum(['none', 'solid', 'double', 'dashed']).optional(),
    pageBorder: z.enum(['none', 'border-simple', 'border-double']).optional(),
    metaFontSize: z.number().positive().optional(),
    date: z.string().optional(),
    instructions: z.string().optional(),
    watermark: z.string().optional(),
    studentName: z.boolean().optional(),
    rollNumber: z.boolean().optional(),
    classSection: z.boolean().optional(),
    dateField: z.boolean().optional(),
    invigilatorSign: z.boolean().optional(),
    footerText: z.string().optional(),
    roughWorkArea: z.enum(['none', 'right']).optional(),
    pageNumbering: z.enum(['hidden', 'page-x-of-y', 'x-slash-y']).optional(),
    studentDetailsGap: z.number().optional(),
    contentAlignment: z.enum(['left', 'center', 'justify']).optional(),
  }),
  email: z.string().email('Invalid email address'),
});

export type ExportPdfRequest = z.infer<typeof ExportPdfRequestSchema>;

// --- Question Schemas ---

export const FetchQuestionsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  subjectId: z.number().int().positive().optional(),
  chapterId: z.number().int().positive().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
  type: z.string().optional(),
});

export type FetchQuestionsInput = z.infer<typeof FetchQuestionsSchema>;

// --- Delete Paper Schema ---

export const DeletePaperSchema = z.object({
  paperId: z.number().int().positive(),
  email: z.string().email(),
});

export type DeletePaperInput = z.infer<typeof DeletePaperSchema>;

// --- Validation Helper ---

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      if (firstError) {
        const path = (firstError.path || []).join('.');
        const message = `${path || 'input'}: ${firstError.message}`;
        return { success: false, error: message };
      }
    }
    return { success: false, error: 'Validation failed' };
  }
}
