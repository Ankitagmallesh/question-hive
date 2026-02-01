'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, 
    BookOpen, 
    ClipboardList, 
    School, 
    Check, 
    CheckCircle,
    Atom,           // Physics
    FlaskConical,   // Chemistry
    Calculator,     // Math
    Dna,            // Biology
    FileText,
    Layers,
    Menu
} from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AppLoader from '../../components/ui/AppLoader';
import LoadingOverlay from '../../components/LoadingOverlay';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.05 
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SelectModules() {
    const { user, loading: authLoading } = useSupabaseAuth();
    const router = useRouter();

    // Data State
    const [exams, setExams] = useState<Array<{ id: number; name: string }>>([]);
    const [subjects, setSubjects] = useState<Array<{ id: number; name: string; examId: number }>>([]);
    const [chapters, setChapters] = useState<Array<{ id: number; name: string; subjectId: number; qCount?: number }>>([]);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
    const [mobileStep, setMobileStep] = useState(1);

    // Auth Check
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setLoading(false);
    }, [authLoading, user, router]);

    // 1. Fetch Exams
    useEffect(() => {
        const loadExams = async () => {
            try {
                const res = await fetch('/api/exams');
                const json = await res.json();
                if (json.success) {
                    const neetExams = json.data.filter((e: any) => /neet/i.test(e.name));
                    setExams(neetExams); 
                    // Auto-select NEET if available
                    if (neetExams.length > 0) {
                        setSelectedExamId(neetExams[0].id);
                        setMobileStep(2); // Skip exam selection step on mobile
                    }
                }
            } catch (e) {
                console.error('Failed to load exams', e);
            }
        };
        loadExams();
    }, []);

    // 2. Fetch Subjects when Exam changes
    useEffect(() => {
        if (selectedExamId === null) {
            setSubjects([]);
            setSelectedSubjectId(null);
            return;
        }
        const loadSubjects = async () => {
            try {
                const res = await fetch(`/api/subjects?examId=${selectedExamId}`);
                const json = await res.json();
                if (json.success) {
                    setSubjects(json.data);
                    // On desktop, auto-select first subject to show something
                    if (window.innerWidth >= 1024 && json.data.length > 0) {
                        setSelectedSubjectId(json.data[0].id);
                    }
                }
            } catch (e) {
                console.error('Failed to load subjects', e);
            }
        };
        loadSubjects();
    }, [selectedExamId]);

    // 3. Fetch Chapters when Subject changes
    useEffect(() => {
        if (selectedSubjectId === null) {
            setChapters([]);
            return;
        }
        const loadChapters = async () => {
            try {
                const res = await fetch(`/api/chapters?subjectId=${selectedSubjectId}`);
                const json = await res.json();
                if (json.success) {
                    const data = json.data.map((c: any) => ({
                        ...c,
                        qCount: c.qCount || Math.floor(Math.random() * 50) + 10 
                    }));
                    setChapters(data);
                }
            } catch (e) {
                console.error('Failed to load chapters', e);
            }
        };
        loadChapters();
    }, [selectedSubjectId]);

    // Handlers
    const handleExamSelect = (id: number) => {
        setSelectedExamId(id);
        setMobileStep(2);
    };

    const handleSubjectSelect = (id: number) => {
        setSelectedSubjectId(id);
        setMobileStep(3);
    };

    const handleMobileBack = () => {
        if (mobileStep > 1) setMobileStep(prev => prev - 1);
    };

    const toggleChapter = (id: number) => {
        setSelectedChapters(prev => 
            prev.includes(id) 
                ? prev.filter(c => c !== id) 
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const currentChapterIds = chapters.map(c => c.id);
        const allSelected = currentChapterIds.every(id => selectedChapters.includes(id));
        
        if (allSelected) {
            setSelectedChapters(prev => prev.filter(id => !currentChapterIds.includes(id)));
        } else {
            const newSelection = new Set([...selectedChapters, ...currentChapterIds]);
            setSelectedChapters(Array.from(newSelection));
        }
    };

    const isAllSelected = chapters.length > 0 && chapters.every(c => selectedChapters.includes(c.id));

    const handleGenerate = () => {
        if (!selectedExamId || selectedChapters.length === 0) return;
        
        const examName = exams.find(e => e.id === selectedExamId)?.name || '';
        const selectedSubjectNames = subjects
            .filter(s => s.id === selectedSubjectId)
            .map(s => s.name);

        const chapterNames = chapters
            .filter(c => selectedChapters.includes(c.id))
            .map(c => c.name);

        const params = new URLSearchParams({
            exam: examName,
            subjects: selectedSubjectNames.join(','),
            chapters: chapterNames.join(',')
        });
        router.push(`/question-papers/create?${params.toString()}`);
    };

    // Helper: Icons
    const getExamIcon = (name: string) => {
        if (/jee/i.test(name)) return <GraduationCap className="w-4 h-4" />;
        if (/neet/i.test(name)) return <ClipboardList className="w-4 h-4" />;
        if (/kcet/i.test(name)) return <BookOpen className="w-4 h-4" />;
        return <School className="w-4 h-4" />;
    };

    const getSubjectIcon = (name: string) => {
        if (/physics/i.test(name)) return <Atom className="w-5 h-5" />;
        if (/chem/i.test(name)) return <FlaskConical className="w-5 h-5" />;
        if (/math/i.test(name)) return <Calculator className="w-5 h-5" />;
        if (/bio/i.test(name)) return <Dna className="w-5 h-5" />;
        return <Layers className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <DashboardLayout>
                 <div className="min-h-screen bg-white flex items-center justify-center">
                    <AppLoader />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Full Bleed Container - uses negative margins to counteract DashboardLayout padding */}
            <div className="
                flex flex-col lg:flex-row bg-white
                lg:-mx-10 lg:-mb-10 lg:-mt-12
                min-h-screen
                relative z-0
            ">
                
                {/* LEFT SIDEBAR (Configuration) */}
                <aside className={`
                    w-full lg:w-[320px] bg-slate-50 border-r border-slate-200 flex-col shrink-0 pt-6 lg:pt-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto
                    ${mobileStep < 3 ? 'flex' : 'hidden lg:flex'}
                `}>
                    <div className="p-6">
                        {/* Branding space or removal */}
                        <div className="mt-4 lg:mt-8"></div>
                        
                        {/* Mobile Back Button */}
                        {mobileStep === 2 && (
                            <button onClick={handleMobileBack} className="lg:hidden mb-6 flex items-center gap-2 text-slate-500 font-bold text-sm">
                                <i className="ri-arrow-left-line"></i> Back to Exams
                            </button>
                        )}

                        {/* 1. Target Exam */}
                        <div className={`mb-8 ${mobileStep === 1 ? 'block' : 'hidden lg:block'}`}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Target Examination</h3>
                            <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 lg:gap-2">
                                {exams.map((exam) => {
                                    const isSelected = selectedExamId === exam.id;
                                    return (
                                        <button
                                            key={exam.id}
                                            onClick={() => handleExamSelect(exam.id)}
                                            className={`
                                                flex items-center gap-3 lg:gap-2 px-4 py-4 lg:py-2 lg:px-3 rounded-xl lg:rounded-lg text-base lg:text-sm font-semibold transition-all duration-200 border w-full lg:w-auto
                                                ${/neet/i.test(exam.name) ? 'order-first lg:order-none' : ''}
                                                ${isSelected 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 lg:shadow-md transform -translate-y-0.5' 
                                                    : 'bg-white text-slate-700 lg:text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900 lg:hover:text-slate-700 hover:-translate-y-0.5 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <span className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100'} lg:p-0 lg:bg-transparent`}>
                                                {getExamIcon(exam.name)}
                                            </span>
                                            {exam.name}
                                            <span className="lg:hidden ml-auto">
                                                <i className="ri-arrow-right-s-line text-lg opacity-50"></i>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Discipline / Subject */}
                        <div className={`${mobileStep === 2 ? 'block' : 'hidden lg:block'}`}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Discipline</h3>
                            <div className="flex flex-col gap-3">
                                {subjects.length === 0 && (
                                    <div className="text-sm text-slate-400 italic px-2">Select an exam first</div>
                                )}
                                {subjects.map((subject) => {
                                    const isSelected = selectedSubjectId === subject.id;
                                    return (
                                        <button
                                            key={subject.id}
                                            onClick={() => handleSubjectSelect(subject.id)}
                                            className={`
                                                w-full flex items-center gap-4 lg:gap-3 p-4 lg:p-3 rounded-xl border transition-all duration-200 group text-left
                                                ${isSelected 
                                                    ? 'bg-indigo-50 border-indigo-600 shadow-md lg:shadow-sm ring-1 ring-indigo-600/10 lg:ring-0' 
                                                    : 'bg-white border-transparent hover:bg-white hover:shadow-md border-slate-100'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-12 h-12 lg:w-10 lg:h-10 rounded-xl lg:rounded-lg flex items-center justify-center transition-colors duration-200
                                                ${isSelected ? 'bg-indigo-600 text-white shadow-lg lg:shadow-none shadow-indigo-200' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}
                                            `}>
                                                {getSubjectIcon(subject.name)}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-bold text-base lg:text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {subject.name}
                                                </div>
                                                <div className="text-xs lg:text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Select to view chapters
                                                </div>
                                            </div>
                                            <div className="lg:hidden text-slate-300">
                                                <i className="ri-arrow-right-s-line text-xl"></i>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* RIGHT WORKSPACE (Main) */}
                <main className={`flex-1 flex-col relative bg-white pt-6 lg:pt-0 ${mobileStep === 3 ? 'flex' : 'hidden lg:flex'}`}>
                    {/* Header */}
                    <div className="px-6 lg:px-8 py-5 border-b border-slate-100 flex justify-between items-center z-10 shrink-0 bg-white mt-4 lg:mt-8 pr-4 lg:pr-24 relative">
                        <div>
                            {/* Mobile Back Button for Step 3 */}
                            <button onClick={handleMobileBack} className="lg:hidden mb-3 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                <i className="ri-arrow-left-line"></i> Back to Subjects
                            </button>
                            <h1 className="text-xl font-bold text-slate-900">Select Modules</h1>
                            <p className="text-sm text-slate-500 font-medium">Customize the syllabus coverage for this paper.</p>
                        </div>

                        {/* Select All Toggle */}
                        <button 
                            onClick={toggleSelectAll}
                            disabled={chapters.length === 0}
                            className={`flex items-center gap-3 cursor-pointer group ${chapters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors hidden sm:block">Select All</span>
                            <div className={`
                                w-11 h-6 rounded-full p-1 transition-colors duration-300
                                ${isAllSelected ? 'bg-indigo-600' : 'bg-slate-200'}
                            `}>
                                <div className={`
                                    w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300
                                    ${isAllSelected ? 'translate-x-5' : 'translate-x-0'}
                                `} />
                            </div>
                        </button>
                    </div>

                    {/* Chapter Grid (Natural Scroll) */}
                    <div className="p-8 pb-32">
                        {chapters.length === 0 ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Layers className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="font-medium">No chapters available</p>
                                <p className="text-sm opacity-60">Select an exam and subject to begin</p>
                            </div>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                key={selectedSubjectId} // Re-animate on subject switch
                            >
                                <AnimatePresence>
                                    {chapters.map((chapter) => {
                                        const isSelected = selectedChapters.includes(chapter.id);
                                        return (
                                            <motion.div
                                                key={chapter.id}
                                                variants={itemVariants}
                                                onClick={() => toggleChapter(chapter.id)}
                                                className={`
                                                    relative group cursor-pointer rounded-xl p-4 border transition-all duration-200 min-h-[100px] flex flex-col justify-between
                                                    ${isSelected 
                                                        ? 'bg-white border-indigo-600 ring-4 ring-indigo-600/5 shadow-lg shadow-indigo-600/10' 
                                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                                                    }
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className={`
                                                        w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                                                        ${isSelected 
                                                            ? 'bg-indigo-600 border-indigo-600 transform scale-105' 
                                                            : 'border-slate-300 group-hover:border-indigo-400'
                                                        }
                                                    `}>
                                                        <Check className={`w-3 h-3 text-white transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h4 className={`font-bold text-sm leading-snug mb-1 transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                        {chapter.name}
                                                    </h4>
                                                    <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        {chapter.qCount} Questions
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>

                    {/* Floating Action Bar - Fixed Position Mobile / Floating Desktop */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 lg:p-0 lg:border-none lg:bg-transparent lg:fixed lg:bottom-8 lg:right-8 lg:left-auto flex items-center justify-between lg:justify-end gap-4 z-50">
                        <AnimatePresence>
                            {selectedChapters.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="bg-slate-100 lg:bg-white px-4 py-2 rounded-full lg:shadow-lg lg:border border-slate-200 text-xs font-bold text-indigo-600 flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    {selectedChapters.length} Selected
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerate}
                            disabled={selectedChapters.length === 0}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-base shadow-xl transition-all duration-300 w-full lg:w-auto justify-center
                                ${selectedChapters.length > 0 
                                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' 
                                    : 'bg-slate-300 cursor-not-allowed'
                                }
                            `}
                        >
                            Generate Paper
                            <CheckCircle className="w-4 h-4" />
                        </motion.button>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
}
