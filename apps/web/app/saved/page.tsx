'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Link from 'next/link';

export default function SavedPapersPage() {
    const [savedPapers, setSavedPapers] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadPapers = () => {
            const papers = localStorage.getItem('saved_papers');
            if (papers) {
                try {
                    setSavedPapers(JSON.parse(papers));
                } catch (e) {
                    console.error("Failed to parse saved papers", e);
                }
            }
        };
        loadPapers();
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this paper?')) {
            const newPapers = savedPapers.filter(p => p.id !== id);
            localStorage.setItem('saved_papers', JSON.stringify(newPapers));
            setSavedPapers(newPapers);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedPapers.map((paper) => (
                            <div key={paper.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                                        📄
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => handleDelete(paper.id, e)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{paper.settings.title}</h3>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{paper.settings.chapters.length} Chapters</span>
                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{paper.paperQuestions.length} Questions</span>
                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{paper.settings.difficulty.toUpperCase()}</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                                    <Link 
                                        href={`/question-papers/create?savedId=${paper.id}`}
                                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:border-indigo-500 hover:text-indigo-600 transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        <i className="ri-edit-line"></i> Edit
                                    </Link>
                                    <button 
                                        onClick={() => {
                                             // Temporary print logic since actual PDF generation depends on the preview state
                                             // Ideally, this would open a preview page specifically for printing
                                             window.open(`/question-papers/create?savedId=${paper.id}&print=true`, '_blank');
                                        }}
                                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        <i className="ri-printer-line"></i> PDF
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 text-center">
                                    Saved on {new Date(paper.savedAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
