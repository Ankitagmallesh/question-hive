'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Link from 'next/link';

export default function SavedPapersPage() {
    const { user, loading } = useSupabaseAuth();
    const [savedPapers, setSavedPapers] = useState<any[]>([]);
    const router = useRouter();

    const [loadingPapers, setLoadingPapers] = useState(true);

    const fetchPapers = async () => {
        if (!user?.email) return;
        
        try {
            setLoadingPapers(true);
            const res = await fetch(`/api/question-papers?email=${user.email}`);
            const data = await res.json();
            
            if (data.success) {
                setSavedPapers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch saved papers", error);
        } finally {
            setLoadingPapers(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchPapers();
        } else if (!loading && !user) {
            // Not logged in
            setLoadingPapers(false);
        }
    }, [user, loading]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this paper?')) {
            return;
        }

        // Optimistic update
        const prevPapers = [...savedPapers];
        setSavedPapers(prev => prev.filter(p => p.id !== id));

        try {
            const res = await fetch(`/api/question-papers/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (!data.success) {
                // Revert on failure
                setSavedPapers(prevPapers);
                alert('Failed to delete paper: ' + data.error);
            }
        } catch (error) {
             setSavedPapers(prevPapers);
             alert('Error deleting paper');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Saved Papers</h1>
                        <p className="text-slate-500 mt-1">Access and manage your saved question papers</p>
                    </div>
                </div>

                {savedPapers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📝</div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No papers saved yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first question paper and save it to access it here later.</p>
                        <Link href="/question-papers" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            <i className="ri-add-line"></i> Create New Paper
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedPapers.map((paper) => (
                            <div key={paper.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md group flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
                                    📄
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-xl mb-2 truncate">{paper.settings.title}</h3>
                                    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                                        <span className="bg-slate-100 px-2 py-1 rounded">{paper.settings.chapters.length} Chapters</span>
                                        <span className="bg-slate-100 px-2 py-1 rounded">{paper.paperQuestions.length} Questions</span>
                                        <span className="bg-slate-100 px-2 py-1 rounded uppercase">{paper.settings.difficulty}</span>
                                        <span className="text-slate-400 font-medium ml-2 py-1">Saved {new Date(paper.savedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link 
                                        href={`/question-papers/create?savedId=${paper.id}`}
                                        className="h-10 px-5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
                                    >
                                        <i className="ri-edit-line"></i> Edit
                                    </Link>
                                    <button 
                                        onClick={() => {
                                             window.open(`/question-papers/create?savedId=${paper.id}&print=true`, '_blank');
                                        }}
                                        className="h-10 px-5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        <i className="ri-printer-line"></i> PDF
                                    </button>
                                     <button 
                                        onClick={(e) => handleDelete(paper.id, e)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <i className="ri-delete-bin-line text-lg"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
