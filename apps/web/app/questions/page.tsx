'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useDebounce } from '../hooks/useDebounce';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Question } from '../lib/questions-data';
import AppLoader from '../../components/ui/AppLoader';
import CreateQuestionModal from './CreateQuestionModal';

const DEBOUNCE_MS = 400;
const LIMIT = 20;

const TYPE_OPTIONS = [
    { value: '', label: 'All types' },
    { value: 'MCQ', label: 'MCQ' },
    { value: 'Short', label: 'Short' },
    { value: 'Long', label: 'Long' },
    { value: 'Numerical', label: 'Numerical' },
];

const DIFFICULTY_OPTIONS = [
    { value: '', label: 'All difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

export default function QuestionsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useSupabaseAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const debouncedSearch = useDebounce(search, DEBOUNCE_MS);
    const debouncedType = useDebounce(filterType, DEBOUNCE_MS);
    const debouncedDifficulty = useDebounce(filterDifficulty, DEBOUNCE_MS);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const abortRef = useRef<AbortController | null>(null);
    const prevFiltersRef = useRef({ search: '', type: '', difficulty: '' });

    const loadQuestions = useCallback(async (opts: { page: number; search: string; type: string; difficulty: string }) => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        const { signal } = abortRef.current;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(opts.page),
                limit: String(LIMIT),
            });
            if (opts.search) params.set('search', opts.search);
            if (opts.type) params.set('type', opts.type);
            if (opts.difficulty) params.set('difficulty', opts.difficulty);

            const res = await fetch(`/api/questions?${params.toString()}`, { signal });
            const json = await res.json();

            if (json.success) {
                const mapped: Question[] = json.data.map((q: { id: string; content: string; questionType?: string; difficulty?: string; marks?: string | number; createdAt: string }) => ({
                    id: q.id,
                    text: q.content,
                    subject: '—',
                    chapter: '—',
                    type: (q.questionType || 'mcq').toLowerCase(),
                    difficulty: (q.difficulty || 'medium').toLowerCase(),
                    marks: Number(q.marks) || 1,
                    createdAt: q.createdAt,
                }));
                setQuestions(mapped);
                if (json.pagination) {
                    setTotalPages(json.pagination.totalPages);
                    setTotalCount(json.pagination.total);
                }
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            console.error('Failed to load questions:', err);
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const prev = prevFiltersRef.current;
        const filtersChanged =
            prev.search !== debouncedSearch || prev.type !== debouncedType || prev.difficulty !== debouncedDifficulty;
        if (filtersChanged) {
            setCurrentPage(1);
            prevFiltersRef.current = { search: debouncedSearch, type: debouncedType, difficulty: debouncedDifficulty };
        }
        const pageToUse = filtersChanged ? 1 : currentPage;

        loadQuestions({ page: pageToUse, search: debouncedSearch, type: debouncedType, difficulty: debouncedDifficulty });
    }, [authLoading, user, router, currentPage, debouncedSearch, debouncedType, debouncedDifficulty, refreshCounter, loadQuestions]);



    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'mcq': return 'bg-blue-100 text-blue-800';
            case 'short': return 'bg-purple-100 text-purple-800';
            case 'long': return 'bg-indigo-100 text-indigo-800';
            case 'numerical': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                   <AppLoader text="Loading Questions..." />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Questions</h2>
                                <p className="mt-2 text-gray-600">Manage your question bank and create new questions</p>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateModal(true)}>
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Question
                            </Button>
                        </div>
                    </div>

                    {/* Search & Filters (debounced; API runs only after {DEBOUNCE_MS}ms idle) */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <Input
                                type="search"
                                placeholder="Search by question text…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                aria-label="Search questions"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="Filter by type"
                        >
                            {TYPE_OPTIONS.map((o) => (
                                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="Filter by difficulty"
                        >
                            {DIFFICULTY_OPTIONS.map((o) => (
                                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        {((search || filterType || filterDifficulty)) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSearch(''); setFilterType(''); setFilterDifficulty(''); }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                                <p className="text-gray-600 mb-4">Click 'Create Question' to add one</p>
                            </CardContent>
                        </Card>
                    ) : (
                        questions.map((question) => (
                            <Card key={question.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <p className="text-lg font-medium text-gray-900 mb-2">
                                                {question.text}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span><strong>Subject:</strong> {question.subject}</span>
                                                <span><strong>Chapter:</strong> {question.chapter}</span>
                                                <span><strong>Marks:</strong> {question.marks}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <Badge className={getTypeColor(question.type)}>
                                                {question.type.toUpperCase()}
                                            </Badge>
                                            <Badge className={getDifficultyColor(question.difficulty)}>
                                                {question.difficulty}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Created: {new Date(question.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                            <Button variant="destructive" size="sm">
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {questions.length > 0 && (
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="flex space-x-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Previous
                            </Button>
                            
                            {/* Simple Page Indicator for now */}
                            <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="text-xs text-slate-500">
                            Showing {(currentPage - 1) * LIMIT + 1} - {Math.min(currentPage * LIMIT, totalCount)} of {totalCount} questions
                        </div>
                    </div>
                )}
            </main>
        </div>

            <CreateQuestionModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => setRefreshCounter((c) => c + 1)}
                userId={typeof user?.id === 'number' ? user.id : 1}
            />
        </DashboardLayout>
    );
}
