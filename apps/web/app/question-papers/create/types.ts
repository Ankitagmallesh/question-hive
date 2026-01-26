export interface Question {
    id: string;
    instanceId?: string;
    text: string;
    type: string; 
    difficulty: 'easy' | 'medium' | 'hard';
    chapter?: string;
    options?: {
        id: string;
        text: string;
        order: number;
    }[];
    marks?: number;
    isAiGenerated?: boolean;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    questions?: Question[];
}

export interface PaperSettings {
    title: string;
    chapters: string[];
    duration: string;
    totalMarks: string;
    difficulty: 'easy' | 'mixed' | 'hard';
    
    // Branding & Layout
    institution: string;
    logo: string | null;
    logoPosition: 'left' | 'center' | 'right';
    font: 'jakarta' | 'merriweather' | 'inter' | 'mono';
    template: 'classic' | 'modern' | 'minimal';
    layout: 'single' | 'double';
    margin: 'S' | 'M' | 'L';
    fontSize: number;
    lineHeight: number;
    metaFontSize: number;
    
    // Formatting
    pageBorder: 'none' | 'border-simple' | 'border-double';
    answerSpace: 'none' | 'lines' | 'box';
    separator: 'none' | 'solid' | 'double' | 'dashed';
    
    // Instructions & Content
    date: string;
    instructions: string;
    watermark: string;
    
    // Student Details
    studentName: boolean;
    rollNumber: boolean;
    classSection: boolean;
    dateField: boolean;
    invigilatorSign: boolean;
    studentDetailsGap?: number;

    // Content Alignment
    contentAlignment?: 'left' | 'center' | 'justify';
    
    // Footer
    footerText: string;
    roughWorkArea: 'none' | 'right' | 'bottom';
    pageNumbering: 'page-x-of-y' | 'x-slash-y' | 'hidden';
}
