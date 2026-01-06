/**
 * Application constants shared across the monorepo
 */

// API Configuration
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        PROFILE: '/api/auth/profile',
    },
    QUESTIONS: {
        BASE: '/api/questions',
        SEARCH: '/api/questions/search',
        BY_CHAPTER: '/api/questions/chapter',
        BY_SUBJECT: '/api/questions/subject',
        BY_EXAM: '/api/questions/exam',
    },
    ACADEMIC: {
        INSTITUTIONS: '/api/institutions',
        EXAMS: '/api/exams',
        SUBJECTS: '/api/subjects',
        CHAPTERS: '/api/chapters',
    },
    QUESTION_PAPERS: {
        BASE: '/api/question-papers',
        GENERATE: '/api/question-papers/generate',
        TEMPLATES: '/api/question-papers/templates',
    },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Logged in successfully!',
    REGISTER: 'Account created successfully!',
    LOGOUT: 'Logged out successfully!',
    SAVE: 'Saved successfully!',
    DELETE: 'Deleted successfully!',
    UPDATE: 'Updated successfully!',
    UPLOAD: 'Uploaded successfully!',
} as const;

// Form Validation
export const VALIDATION_RULES = {
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: true,
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    FILE: {
        MAX_SIZE_MB: 10,
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    },
} as const;

// UI Constants
export const UI_CONSTANTS = {
    THEME: {
        COLORS: {
            PRIMARY: '#3B82F6', // Blue-500
            SECONDARY: '#1E40AF', // Blue-700
            SUCCESS: '#10B981', // Emerald-500
            WARNING: '#F59E0B', // Amber-500
            ERROR: '#EF4444', // Red-500
            INFO: '#06B6D4', // Cyan-500
        },
    },
    BREAKPOINTS: {
        SM: '640px',
        MD: '768px',
        LG: '1024px',
        XL: '1280px',
        '2XL': '1536px',
    },
    ANIMATION: {
        DURATION: {
            FAST: '150ms',
            NORMAL: '300ms',
            SLOW: '500ms',
        },
        EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language',
} as const;

// Question Types
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    SHORT_ANSWER: 'short_answer',
    LONG_ANSWER: 'long_answer',
    FILL_IN_BLANK: 'fill_in_blank',
    MATCHING: 'matching',
    ESSAY: 'essay',
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
} as const;

// User Roles
export const USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
} as const;

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
    TIME: 'HH:mm',
    DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

// File Upload
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
        IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    },
} as const;

export default {
    API_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION_RULES,
    UI_CONSTANTS,
    PAGINATION,
    STORAGE_KEYS,
    QUESTION_TYPES,
    DIFFICULTY_LEVELS,
    USER_ROLES,
    DATE_FORMATS,
    FILE_UPLOAD,
};
