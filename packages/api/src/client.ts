import type {
    User,
    LoginRequest,
    RegisterRequest,
    Question,
    QuestionPaper,
    Institution,
    Exam,
    Subject,
    Chapter
} from '@repo/types';

// Custom API Response type for the client
interface ClientApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
}

// Authentication response type
interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

// Constants from utils - using direct imports to avoid module resolution issues
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register',
        LOGOUT: '/api/v1/auth/logout',
        REFRESH: '/api/v1/auth/refresh',
        PROFILE: '/api/v1/user/profile',
    },
    QUESTIONS: {
        BASE: '/api/v1/questions',
        SEARCH: '/api/v1/questions/search',
        BY_CHAPTER: '/api/v1/questions/chapter',
        BY_SUBJECT: '/api/v1/questions/subject',
        BY_EXAM: '/api/v1/questions/exam',
    },
    ACADEMIC: {
        INSTITUTIONS: '/api/v1/academic/institutions',
        EXAMS: '/api/v1/academic/exams',
        SUBJECTS: '/api/v1/academic/subjects',
        CHAPTERS: '/api/v1/academic/chapters',
    },
    QUESTION_PAPERS: {
        BASE: '/api/v1/question-papers',
        GENERATE: '/api/v1/question-papers/generate',
        TEMPLATES: '/api/v1/question-papers/templates',
    },
} as const;

const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
} as const;

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
}

/**
 * HTTP methods supported by the API client
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request options for API calls
 */
interface RequestOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

/**
 * Generic API client for making HTTP requests
 */
export class ApiClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;
    private timeout: number;

    constructor(config: ApiClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.timeout = config.timeout || 10000; // 10 second default timeout
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
    }

    /**
     * Set authorization token
     */
    setAuthToken(token: string) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Remove authorization token
     */
    removeAuthToken() {
        delete this.defaultHeaders['Authorization'];
    }

    /**
     * Make a generic HTTP request
     */
    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ClientApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        const {
            method = 'GET',
            headers = {},
            body,
            timeout = this.timeout,
        } = options;

        const config: RequestInit = {
            method,
            headers: {
                ...this.defaultHeaders,
                ...headers,
            },
            signal: AbortSignal.timeout(timeout),
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: responseData.error || responseData.message || ERROR_MESSAGES.GENERIC,
                    statusCode: response.status,
                };
            }

            // Handle Go server response format which wraps data in a 'data' field
            const data = responseData.data || responseData;

            return {
                success: true,
                data,
                statusCode: response.status,
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return {
                        success: false,
                        error: 'Request timeout',
                        statusCode: 408,
                    };
                }
                return {
                    success: false,
                    error: error.message,
                    statusCode: 0,
                };
            }
            return {
                success: false,
                error: ERROR_MESSAGES.NETWORK,
                statusCode: 0,
            };
        }
    }

    /**
     * Authentication API methods
     */
    auth = {
        login: (credentials: LoginRequest) =>
            this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: credentials,
            }),

        register: (userData: RegisterRequest) =>
            this.request<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                body: userData,
            }),

        logout: () =>
            this.request<void>(API_ENDPOINTS.AUTH.LOGOUT, {
                method: 'POST',
            }),

        refreshToken: () =>
            this.request<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
                method: 'POST',
            }),

        getProfile: () =>
            this.request<User>(API_ENDPOINTS.AUTH.PROFILE),
    };

    /**
     * Questions API methods
     */
    questions = {
        getAll: (params?: { page?: number; limit?: number; search?: string }) => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.set('page', params.page.toString());
            if (params?.limit) searchParams.set('limit', params.limit.toString());
            if (params?.search) searchParams.set('search', params.search);

            const query = searchParams.toString();
            const endpoint = query ? `${API_ENDPOINTS.QUESTIONS.BASE}?${query}` : API_ENDPOINTS.QUESTIONS.BASE;

            return this.request<Question[]>(endpoint);
        },

        getById: (id: string) =>
            this.request<Question>(`${API_ENDPOINTS.QUESTIONS.BASE}/${id}`),

        create: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) =>
            this.request<Question>(API_ENDPOINTS.QUESTIONS.BASE, {
                method: 'POST',
                body: question,
            }),

        update: (id: string, question: Partial<Question>) =>
            this.request<Question>(`${API_ENDPOINTS.QUESTIONS.BASE}/${id}`, {
                method: 'PUT',
                body: question,
            }),

        delete: (id: string) =>
            this.request<void>(`${API_ENDPOINTS.QUESTIONS.BASE}/${id}`, {
                method: 'DELETE',
            }),

        search: (query: string) => {
            const searchParams = new URLSearchParams({ q: query });
            return this.request<Question[]>(`${API_ENDPOINTS.QUESTIONS.SEARCH}?${searchParams}`);
        },

        getByChapter: (chapterId: string) =>
            this.request<Question[]>(`${API_ENDPOINTS.QUESTIONS.BY_CHAPTER}/${chapterId}`),

        getBySubject: (subjectId: string) =>
            this.request<Question[]>(`${API_ENDPOINTS.QUESTIONS.BY_SUBJECT}/${subjectId}`),

        getByExam: (examId: string) =>
            this.request<Question[]>(`${API_ENDPOINTS.QUESTIONS.BY_EXAM}/${examId}`),
    };

    /**
     * Academic hierarchy API methods
     */
    academic = {
        institutions: {
            getAll: () => this.request<Institution[]>(API_ENDPOINTS.ACADEMIC.INSTITUTIONS),
            getById: (id: string) => this.request<Institution>(`${API_ENDPOINTS.ACADEMIC.INSTITUTIONS}/${id}`),
            create: (institution: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>) =>
                this.request<Institution>(API_ENDPOINTS.ACADEMIC.INSTITUTIONS, {
                    method: 'POST',
                    body: institution,
                }),
            update: (id: string, institution: Partial<Institution>) =>
                this.request<Institution>(`${API_ENDPOINTS.ACADEMIC.INSTITUTIONS}/${id}`, {
                    method: 'PUT',
                    body: institution,
                }),
            delete: (id: string) =>
                this.request<void>(`${API_ENDPOINTS.ACADEMIC.INSTITUTIONS}/${id}`, {
                    method: 'DELETE',
                }),
        },

        exams: {
            getAll: (institutionId?: string) => {
                const query = institutionId ? `?institution_id=${institutionId}` : '';
                return this.request<Exam[]>(`${API_ENDPOINTS.ACADEMIC.EXAMS}${query}`);
            },
            getById: (id: string) => this.request<Exam>(`${API_ENDPOINTS.ACADEMIC.EXAMS}/${id}`),
            create: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) =>
                this.request<Exam>(API_ENDPOINTS.ACADEMIC.EXAMS, {
                    method: 'POST',
                    body: exam,
                }),
            update: (id: string, exam: Partial<Exam>) =>
                this.request<Exam>(`${API_ENDPOINTS.ACADEMIC.EXAMS}/${id}`, {
                    method: 'PUT',
                    body: exam,
                }),
            delete: (id: string) =>
                this.request<void>(`${API_ENDPOINTS.ACADEMIC.EXAMS}/${id}`, {
                    method: 'DELETE',
                }),
        },

        subjects: {
            getAll: (examId?: string) => {
                const query = examId ? `?exam_id=${examId}` : '';
                return this.request<Subject[]>(`${API_ENDPOINTS.ACADEMIC.SUBJECTS}${query}`);
            },
            getById: (id: string) => this.request<Subject>(`${API_ENDPOINTS.ACADEMIC.SUBJECTS}/${id}`),
            create: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) =>
                this.request<Subject>(API_ENDPOINTS.ACADEMIC.SUBJECTS, {
                    method: 'POST',
                    body: subject,
                }),
            update: (id: string, subject: Partial<Subject>) =>
                this.request<Subject>(`${API_ENDPOINTS.ACADEMIC.SUBJECTS}/${id}`, {
                    method: 'PUT',
                    body: subject,
                }),
            delete: (id: string) =>
                this.request<void>(`${API_ENDPOINTS.ACADEMIC.SUBJECTS}/${id}`, {
                    method: 'DELETE',
                }),
        },

        chapters: {
            getAll: (subjectId?: string) => {
                const query = subjectId ? `?subject_id=${subjectId}` : '';
                return this.request<Chapter[]>(`${API_ENDPOINTS.ACADEMIC.CHAPTERS}${query}`);
            },
            getById: (id: string) => this.request<Chapter>(`${API_ENDPOINTS.ACADEMIC.CHAPTERS}/${id}`),
            create: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) =>
                this.request<Chapter>(API_ENDPOINTS.ACADEMIC.CHAPTERS, {
                    method: 'POST',
                    body: chapter,
                }),
            update: (id: string, chapter: Partial<Chapter>) =>
                this.request<Chapter>(`${API_ENDPOINTS.ACADEMIC.CHAPTERS}/${id}`, {
                    method: 'PUT',
                    body: chapter,
                }),
            delete: (id: string) =>
                this.request<void>(`${API_ENDPOINTS.ACADEMIC.CHAPTERS}/${id}`, {
                    method: 'DELETE',
                }),
        },
    };

    /**
     * Question Papers API methods
     */
    questionPapers = {
        getAll: (params?: { page?: number; limit?: number }) => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.set('page', params.page.toString());
            if (params?.limit) searchParams.set('limit', params.limit.toString());

            const query = searchParams.toString();
            const endpoint = query ? `${API_ENDPOINTS.QUESTION_PAPERS.BASE}?${query}` : API_ENDPOINTS.QUESTION_PAPERS.BASE;

            return this.request<QuestionPaper[]>(endpoint);
        },

        getById: (id: string) =>
            this.request<QuestionPaper>(`${API_ENDPOINTS.QUESTION_PAPERS.BASE}/${id}`),

        create: (questionPaper: Omit<QuestionPaper, 'id' | 'createdAt' | 'updatedAt'>) =>
            this.request<QuestionPaper>(API_ENDPOINTS.QUESTION_PAPERS.BASE, {
                method: 'POST',
                body: questionPaper,
            }),

        update: (id: string, questionPaper: Partial<QuestionPaper>) =>
            this.request<QuestionPaper>(`${API_ENDPOINTS.QUESTION_PAPERS.BASE}/${id}`, {
                method: 'PUT',
                body: questionPaper,
            }),

        delete: (id: string) =>
            this.request<void>(`${API_ENDPOINTS.QUESTION_PAPERS.BASE}/${id}`, {
                method: 'DELETE',
            }),

        generate: (config: any) =>
            this.request<QuestionPaper>(API_ENDPOINTS.QUESTION_PAPERS.GENERATE, {
                method: 'POST',
                body: config,
            }),

        getTemplates: () =>
            this.request<any[]>(API_ENDPOINTS.QUESTION_PAPERS.TEMPLATES),
    };
}

/**
 * Default API client instance
 */
export const createApiClient = (config: ApiClientConfig) => new ApiClient(config);

/**
 * Browser API client factory (for Next.js apps)
 */
export const createBrowserApiClient = (baseUrl?: string) => {
    const config: ApiClientConfig = {
        baseUrl: baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080'),
    };

    return new ApiClient(config);
};
