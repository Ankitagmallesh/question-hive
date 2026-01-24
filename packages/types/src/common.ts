// API Response Types
export interface APIResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T[];
    pagination: Pagination;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Query Parameters
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface QuestionFilters extends PaginationParams {
    subjectId?: number;
    chapterId?: number;
    difficulty?: string;
    type?: string;
    search?: string;
}

// Error Types
export interface APIError {
    message: string;
    status: number;
    code?: string;
}

export class APIException extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'APIException';
        this.status = status;
        this.code = code;
    }
}

// Form Types
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'number' | 'checkbox';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

export interface FormState<T = unknown> {
    data: T;
    errors: Record<string, string>;
    isSubmitting: boolean;
    isValid: boolean;
}

// UI Component Types
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface TableColumn<T = unknown> {
    key: keyof T;
    title: string;
    sortable?: boolean;
    render?: (value: T[keyof T], record: T) => React.ReactNode;
    width?: string | number;
}

export interface TableProps<T = unknown> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    pagination?: Pagination;
    onPageChange?: (page: number) => void;
    onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
}

// Dashboard Types
export interface DashboardStats {
    totalQuestions: number;
    totalPapers: number;
    totalUsers: number;
    monthlyActivity: {
        questionsCreated: number;
        papersGenerated: number;
        usersRegistered: number;
    };
}

export interface ActivityLog {
    id: number;
    userId: number;
    user?: {
        name: string;
        email: string;
    };
    action: string;
    resourceType: 'question' | 'paper' | 'user';
    resourceId: number;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Theme Types
export interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        background: string;
        surface: string;
        text: string;
    };
    fonts: {
        primary: string;
        mono: string;
    };
    breakpoints: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}
