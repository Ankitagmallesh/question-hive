import type { User } from './auth';

// Academic Structure Types
export interface Exam {
    id: number;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    subjects?: Subject[];
}

export interface Subject {
    id: number;
    name: string;
    code: string;
    description?: string;
    examId: number;
    exam?: Exam;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    chapters?: Chapter[];
    questions?: Question[];
}

export interface Chapter {
    id: number;
    name: string;
    code: string;
    description?: string;
    weightage: number;
    subjectId: number;
    subject?: Subject;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    questions?: Question[];
}

// Question Types
export type QuestionType = 'mcq' | 'numerical' | 'descriptive' | 'true_false' | 'fill_blank';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
    id: number;
    content: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    marks: number;
    subjectId: number;
    subject?: Subject;
    chapterId: number;
    chapter?: Chapter;
    options?: string; // JSON string for MCQ options
    correctAnswer?: string;
    explanation?: string;
    createdBy: number;
    creator?: User;
    isActive: boolean;
    isAIGenerated: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuestionRequest {
    content: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    marks: number;
    subjectId: number;
    chapterId: number;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
}

export interface UpdateQuestionRequest {
    content?: string;
    type?: QuestionType;
    difficulty?: QuestionDifficulty;
    marks?: number;
    subjectId?: number;
    chapterId?: number;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
}

// Question Paper Types
export type QuestionPaperStatus = 'draft' | 'published' | 'archived';

export interface QuestionPaper {
    id: number;
    title: string;
    description?: string;
    examDate?: string;
    duration?: number; // in minutes
    totalMarks: number;
    instructions?: string;
    subjectId: number;
    subject?: Subject;
    createdBy: number;
    creator?: User;
    isActive: boolean;
    status: QuestionPaperStatus;
    createdAt: string;
    updatedAt: string;
    items?: QuestionPaperItem[];
}

export interface QuestionPaperItem {
    id: number;
    questionPaperId: number;
    questionPaper?: QuestionPaper;
    questionId: number;
    question?: Question;
    orderIndex: number;
    marks: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuestionPaperRequest {
    title: string;
    description?: string;
    examDate?: string;
    duration?: number;
    instructions?: string;
    subjectId: number;
}

export interface AddQuestionToPaperRequest {
    questionId: number;
    orderIndex: number;
    marks: number;
}
