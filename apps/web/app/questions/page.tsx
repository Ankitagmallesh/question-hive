'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import type { User } from '@repo/types';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { Question } from '../lib/questions-data';
import AppLoader from '../../components/ui/AppLoader';
import CreateQuestionModal from './CreateQuestionModal';

export default function QuestionsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useSupabaseAuth(); // Keep for auth check
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const LIMIT = 20;

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }
            loadQuestions();
    }, [authLoading, user, router, currentPage]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(LIMIT)
            });

            const res = await fetch(`/api/questions?${params.toString()}`);
            const json = await res.json();
            
            if (json.success) {
                const mapped: Question[] = json.data.map((q: { id: string; content: string; questionType?: string; difficulty?: string; marks?: number | string; createdAt: string }) => ({
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
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setLoading(false);
        }
    };



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
                    <div className="mb-8">
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
                onSuccess={loadQuestions}
                userId={typeof user?.id === 'number' ? user.id : 1}
            />
        </DashboardLayout>
    );
}
