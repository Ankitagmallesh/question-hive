'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AppLoader from '../../components/ui/AppLoader';
import AppLoader from '../../components/ui/AppLoader';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SavedPaper {
    id: string;
    settings: { title: string; chapters: unknown[]; difficulty: string };
    paperQuestions: unknown[];
    savedAt: string;
}

export default function SavedPapersPage() {
    const { user, loading } = useSupabaseAuth();
    const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
    const router = useRouter();
    const [exportingPaperId, setExportingPaperId] = useState<string | null>(null);

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
            if (!user?.email) {
                // Should not happen if button rendered, but safety check
                throw new Error('User email not found');
            }

            const res = await fetch(`/api/question-papers/${id}?email=${encodeURIComponent(user.email)}`, {
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

    const handleExportPdf = async (paper: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (exportingPaperId) return; // Prevent multiple exports
        
        setExportingPaperId(paper.id);
        toast.info('Generating PDF...', { duration: 2000 });

        try {
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: paper.settings.title,
                    institution: paper.settings.institution,
                    duration: paper.settings.duration,
                    totalMarks: paper.settings.totalMarks,
                    template: paper.settings.template,
                    font: paper.settings.font,
                    fontSize: paper.settings.fontSize,
                    margin: paper.settings.margin,
                    
                    // Branding & Layout
                    logo: paper.settings.logo,
                    logoPosition: paper.settings.logoPosition,
                    layout: paper.settings.layout,
                    lineHeight: paper.settings.lineHeight,
                    answerSpace: paper.settings.answerSpace,
                    separator: paper.settings.separator,
                    pageBorder: paper.settings.pageBorder,
                    metaFontSize: paper.settings.metaFontSize,
                    
                    date: paper.settings.date,
                    instructions: paper.settings.instructions,
                    contentAlignment: paper.settings.contentAlignment,
                    watermark: paper.settings.watermark,
                    studentName: paper.settings.studentName,
                    rollNumber: paper.settings.rollNumber,
                    classSection: paper.settings.classSection,
                    dateField: paper.settings.dateField,
                    invigilatorSign: paper.settings.invigilatorSign,
                    studentDetailsGap: paper.settings.studentDetailsGap,
                    footerText: paper.settings.footerText,
                    roughWorkArea: paper.settings.roughWorkArea,
                    pageNumbering: paper.settings.pageNumbering,
                    withAnswerKey: paper.settings.withAnswerKey,

                    questions: paper.paperQuestions.map((q: any) => ({
                        id: q.id,
                        text: q.text,
                        marks: q.marks,
                        options: q.options?.map((opt: any) => ({
                            id: opt.id,
                            text: opt.text
                        }))
                    }))
                })
            });

            if (!response.ok) {
                let errorMessage = 'Failed to generate PDF';
                try {
                    const errData = await response.json();
                    errorMessage = errData.error || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Check if it's a zip or single PDF
            const contentType = response.headers.get('content-type');
            const filename = contentType?.includes('zip') 
                ? `${paper.settings.title || 'Question_Paper'}.zip`
                : `${paper.settings.title || 'Question_Paper'}.pdf`;
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('PDF downloaded successfully!');
        } catch (error: any) {
            console.error('Export error:', error);
            toast.error(error.message || 'Failed to export PDF');
        } finally {
            setExportingPaperId(null);
        }
    };

    if (loadingPapers) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <AppLoader text="Loading Saved Papers..." />
                </div>
            </DashboardLayout>
        );
    }

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
                            <div key={paper.id} className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md group flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl md:text-2xl shrink-0">
                                    📄
                                </div>
                                
                                <div className="flex-1 min-w-0 w-full">
                                    <h3 className="font-bold text-slate-900 text-lg md:text-xl mb-1 md:mb-2 truncate">{paper.settings.title}</h3>
                                    <div className="flex flex-wrap gap-2 text-[10px] md:text-xs font-bold text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 md:py-1 rounded">{paper.settings.chapters.length} Chapters</span>
                                        <span className="bg-slate-100 px-2 py-0.5 md:py-1 rounded">{paper.paperQuestions.length} Questions</span>
                                        <span className="bg-slate-100 px-2 py-0.5 md:py-1 rounded uppercase">{paper.settings.difficulty}</span>
                                        <span className="text-slate-400 font-medium ml-0 md:ml-2 py-0.5 md:py-1">Saved {new Date(paper.savedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <Link 
                                        href={`/question-papers/create?savedId=${paper.id}`}
                                        className="flex-1 md:flex-none h-9 md:h-10 px-4 md:px-5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-xs md:text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <i className="ri-edit-line"></i> Edit
                                    </Link>
                                    <button 
                                        onClick={(e) => handleExportPdf(paper, e)}
                                        disabled={exportingPaperId === paper.id}
                                        className="flex-1 md:flex-none h-9 md:h-10 px-4 md:px-5 bg-indigo-600 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {exportingPaperId === paper.id ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                                        ) : (
                                            <><i className="ri-file-pdf-line"></i> PDF</>
                                        )}
                                    </button>
                                     <button 
                                        onClick={(e) => handleDelete(paper.id, e)}
                                        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
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
