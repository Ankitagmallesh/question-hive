export interface Question {
    id: string;
    text: string;
    type: 'mcq' | 'short' | 'long' | 'numerical';
    difficulty: 'easy' | 'medium' | 'hard';
    marks: number;
    subject: string;
    chapter: string;
    createdAt: string;
    updatedAt: string;
}

export const questionsData: Question[] = [
    {
        id: '1',
        text: 'What is the derivative of x²?',
        type: 'short',
        difficulty: 'easy',
        marks: 2,
        subject: 'Mathematics',
        chapter: 'Calculus',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        text: 'Explain the theory of relativity in detail.',
        type: 'long',
        difficulty: 'hard',
        marks: 10,
        subject: 'Physics',
        chapter: 'Modern Physics',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
    },
    {
        id: '3',
        text: 'What is the atomic number of Carbon?',
        type: 'mcq',
        difficulty: 'easy',
        marks: 1,
        subject: 'Chemistry',
        chapter: 'Atomic Structure',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
    },
    {
        id: '4',
        text: 'Calculate the integral of 2x dx',
        type: 'numerical',
        difficulty: 'medium',
        marks: 3,
        subject: 'Mathematics',
        chapter: 'Integration',
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z'
    },
    {
        id: '5',
        text: 'What is Newton\'s second law of motion?',
        type: 'short',
        difficulty: 'easy',
        marks: 2,
        subject: 'Physics',
        chapter: 'Laws of Motion',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z'
    },
    {
        id: '6',
        text: 'Describe the structure of benzene molecule',
        type: 'long',
        difficulty: 'medium',
        marks: 5,
        subject: 'Chemistry',
        chapter: 'Organic Chemistry',
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-06T00:00:00Z'
    }
];