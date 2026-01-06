'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { User, Question, Institution, Exam, Subject, Chapter } from '@repo/types';

/**
 * Hook for managing authentication state
 */
export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user profile on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await apiClient.auth.getProfile();
                if (response.success && response.data) {
                    setUser(response.data);
                } else {
                    // Token might be invalid
                    localStorage.removeItem('auth_token');
                    apiClient.removeAuthToken();
                }
            } catch (err) {
                console.error('Failed to load user:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.auth.login({ email, password });

            if (response.success && response.data) {
                const { user: userData, token } = response.data;
                setUser(userData);
                apiClient.setAuthToken(token);
                localStorage.setItem('auth_token', token);
                return { success: true };
            } else {
                setError(response.error || 'Login failed');
                return { success: false, error: response.error };
            }
        } catch (err) {
            const errorMessage = 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.auth.register({
                email,
                password,
                name
            });

            if (response.success && response.data) {
                const { user: userData, token } = response.data;
                setUser(userData);
                apiClient.setAuthToken(token);
                localStorage.setItem('auth_token', token);
                return { success: true };
            } else {
                setError(response.error || 'Registration failed');
                return { success: false, error: response.error };
            }
        } catch (err) {
            const errorMessage = 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        try {
            await apiClient.auth.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            apiClient.removeAuthToken();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };
}

/**
 * Hook for fetching questions with pagination
 */
export function useQuestions(params?: { page?: number; limit?: number; search?: string }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiClient.questions.getAll(params);
                if (response.success && response.data) {
                    setQuestions(response.data);
                } else {
                    setError(response.error || 'Failed to fetch questions');
                }
            } catch (err) {
                setError('Failed to fetch questions');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [params?.page, params?.limit, params?.search]);

    return { questions, loading, error };
}

/**
 * Hook for fetching academic hierarchy
 */
export function useAcademicData() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInstitutions = async () => {
        try {
            const response = await apiClient.academic.institutions.getAll();
            if (response.success && response.data) {
                setInstitutions(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch institutions:', err);
        }
    };

    const fetchExams = async (institutionId?: string) => {
        try {
            const response = await apiClient.academic.exams.getAll(institutionId);
            if (response.success && response.data) {
                setExams(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch exams:', err);
        }
    };

    const fetchSubjects = async (examId?: string) => {
        try {
            const response = await apiClient.academic.subjects.getAll(examId);
            if (response.success && response.data) {
                setSubjects(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        }
    };

    const fetchChapters = async (subjectId?: string) => {
        try {
            const response = await apiClient.academic.chapters.getAll(subjectId);
            if (response.success && response.data) {
                setChapters(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch chapters:', err);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);

            try {
                await fetchInstitutions();
            } catch (err) {
                setError('Failed to load academic data');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    return {
        institutions,
        exams,
        subjects,
        chapters,
        loading,
        error,
        fetchExams,
        fetchSubjects,
        fetchChapters,
    };
}
