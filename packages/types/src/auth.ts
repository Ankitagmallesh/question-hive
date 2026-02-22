// Auth Types
export interface User {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'professor';
    isActive: boolean;
    credits: number;
    lastLoginAt?: string;
    institutionId?: number;
    institution?: Institution;
    createdAt: string;
    updatedAt: string;
}

export interface Institution {
    id: number;
    name: string;
    code: string;
    type: 'school' | 'college' | 'university';
    address?: string;
    contactEmail?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    institutionId?: number;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}
