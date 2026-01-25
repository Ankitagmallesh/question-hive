'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../../hooks/use-toast";

interface Option {
    text: string;
    isCorrect: boolean;
}

interface Exam { id: number; name: string; code: string }
interface Subject { id: number; name: string; code: string }
interface Chapter { id: number; name: string; code: string }
interface Difficulty { id: number; name: string }
interface QuestionType { id: number; name: string; code: string; requiresOptions: boolean }

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: number;
}

// Custom Dropdown Component with styled options
function CustomDropdown<T extends { id: number; name: string }>({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder,
    disabled = false,
    icon
}: {
    label: string;
    options: T[];
    value: T | null;
    onChange: (item: T | null) => void;
    placeholder: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {label}
            </label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full p-3 pr-10 border rounded-xl text-left text-sm font-medium transition-all flex items-center gap-2
                    ${disabled 
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-md cursor-pointer shadow-sm'
                    }
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
                `}
            >
                {icon && <span className="text-slate-400">{icon}</span>}
                <span className={value ? 'text-slate-700' : 'text-slate-400'}>
                    {value?.name || placeholder}
                </span>
            </button>
            <div className="absolute right-3 top-[38px] pointer-events-none">
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-56 overflow-y-auto overscroll-contain">
                        {options.length === 0 ? (
                            <div className="p-3 text-sm text-slate-400 text-center">No options available</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 hover:bg-blue-50 
                                        ${value?.id === option.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}
                                    `}
                                >
                                    {value?.id === option.id && (
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    <span className={value?.id === option.id ? '' : 'ml-7'}>{option.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CreateQuestionModal({ isOpen, onClose, onSuccess, userId }: CreateQuestionModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Dropdown data
    const [exams, setExams] = useState<Exam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
    
    // Form state - now storing full objects for custom dropdowns
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
    const [content, setContent] = useState('');
    const [marks, setMarks] = useState(1);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [explanation, setExplanation] = useState('');
    const [questionOptions, setQuestionOptions] = useState<Option[]>([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);

    // Handle scroll on the modal container
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Load initial dropdown data
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    // Load subjects when exam changes
    useEffect(() => {
        if (selectedExam) {
            loadSubjects(selectedExam.id);
            setSelectedSubject(null);
            setSelectedChapter(null);
            setSubjects([]);
            setChapters([]);
        }
    }, [selectedExam]);

    // Load chapters when subject changes
    useEffect(() => {
        if (selectedSubject) {
            loadChapters(selectedSubject.id);
            setSelectedChapter(null);
            setChapters([]);
        }
    }, [selectedSubject]);

    const loadInitialData = async () => {
        try {
            const res = await fetch('/api/questions/metadata?type=all');
            const json = await res.json();
            if (json.success) {
                setExams(json.data.exams || []);
                setDifficulties(json.data.difficulties || []);
                setQuestionTypes(json.data.questionTypes || []);
                // Set default type to MCQ if available
                const mcqType = json.data.questionTypes?.find((t: QuestionType) => t.code?.toLowerCase() === 'mcq');
                if (mcqType) setSelectedType(mcqType);
            }
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
        }
    };

    const loadSubjects = async (examId: number) => {
        try {
            const res = await fetch(`/api/questions/metadata?type=subjects&parentId=${examId}`);
            const json = await res.json();
            if (json.success) {
                setSubjects(json.data || []);
            }
        } catch (error) {
            console.error('Failed to load subjects:', error);
        }
    };

    const loadChapters = async (subjectId: number) => {
        try {
            const res = await fetch(`/api/questions/metadata?type=chapters&parentId=${subjectId}`);
            const json = await res.json();
            if (json.success) {
                setChapters(json.data || []);
            }
        } catch (error) {
            console.error('Failed to load chapters:', error);
        }
    };

    const requiresOptions = selectedType?.requiresOptions || selectedType?.code?.toLowerCase() === 'mcq';

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...questionOptions];
        const opt = newOptions[index];
        if (opt) {
            opt.text = text;
            setQuestionOptions(newOptions);
        }
    };

    const handleCorrectChange = (index: number) => {
        const newOptions = questionOptions.map((opt, i) => ({ ...opt, isCorrect: i === index }));
        setQuestionOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!content.trim()) {
            toast({ title: 'Error', description: 'Question content is required', variant: 'destructive' });
            return;
        }
        if (!selectedChapter) {
            toast({ title: 'Error', description: 'Please select Exam, Subject, and Chapter', variant: 'destructive' });
            return;
        }
        if (!selectedDifficulty) {
            toast({ title: 'Error', description: 'Please select a difficulty level', variant: 'destructive' });
            return;
        }
        if (!selectedType) {
            toast({ title: 'Error', description: 'Please select a question type', variant: 'destructive' });
            return;
        }

        // Build correct answer for MCQ
        let finalCorrectAnswer = correctAnswer;
        if (requiresOptions) {
            const correctIndex = questionOptions.findIndex(o => o.isCorrect);
            finalCorrectAnswer = String.fromCharCode(65 + correctIndex); // A, B, C, D
        }

        setLoading(true);
        try {
            const res = await fetch('/api/questions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    chapterId: selectedChapter.id,
                    difficultyLevelId: selectedDifficulty.id,
                    questionTypeId: selectedType.id,
                    marks,
                    correctAnswer: finalCorrectAnswer,
                    explanation,
                    options: requiresOptions ? questionOptions.filter(o => o.text.trim()) : undefined,
                    createdBy: userId
                })
            });

            const json = await res.json();
            if (json.success) {
                toast({ title: 'Success', description: 'Question created successfully!' });
                resetForm();
                onSuccess();
                onClose();
            } else {
                toast({ title: 'Error', description: json.error || 'Failed to create question', variant: 'destructive' });
            }
        } catch (error) {
            console.error('Error creating question:', error);
            toast({ title: 'Error', description: 'Failed to create question', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setContent('');
        setMarks(1);
        setCorrectAnswer('');
        setExplanation('');
        setSelectedExam(null);
        setSelectedSubject(null);
        setSelectedChapter(null);
        setSelectedDifficulty(null);
        setQuestionOptions([
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-auto" data-lenis-prevent>
                {/* Header - Fixed at top */}
                <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-5 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white">Create New Question</h2>
                        <p className="text-blue-100 text-sm mt-0.5">Add a custom question to your bank</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
                    <form id="create-question-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Cascading Dropdowns - Section 1 */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-slate-700">Classification</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomDropdown
                                    label="Examination *"
                                    options={exams}
                                    value={selectedExam}
                                    onChange={setSelectedExam}
                                    placeholder="Select Exam"
                                />
                                <CustomDropdown
                                    label="Subject *"
                                    options={subjects}
                                    value={selectedSubject}
                                    onChange={setSelectedSubject}
                                    placeholder={selectedExam ? "Select Subject" : "Select Exam first"}
                                    disabled={!selectedExam}
                                />
                                <CustomDropdown
                                    label="Chapter *"
                                    options={chapters}
                                    value={selectedChapter}
                                    onChange={setSelectedChapter}
                                    placeholder={selectedSubject ? "Select Chapter" : "Select Subject first"}
                                    disabled={!selectedSubject}
                                />
                            </div>
                        </div>

                        {/* Question Type & Difficulty - Section 2 */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-slate-700">Question Settings</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <CustomDropdown
                                    label="Question Type *"
                                    options={questionTypes}
                                    value={selectedType}
                                    onChange={setSelectedType}
                                    placeholder="Select Type"
                                />
                                <CustomDropdown
                                    label="Difficulty *"
                                    options={difficulties}
                                    value={selectedDifficulty}
                                    onChange={setSelectedDifficulty}
                                    placeholder="Select Difficulty"
                                />
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="marks">Marks *</label>
                                    <Input 
                                        id="marks"
                                        type="number" 
                                        min={1} 
                                        value={marks} 
                                        onChange={(e) => setMarks(Number(e.target.value))}
                                        className="w-full h-[48px] rounded-xl border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="question">Question *</label>
                            <textarea 
                                id="question"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter your question here..."
                                rows={3}
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm text-slate-700 min-h-[100px]"
                            />
                        </div>

                        {/* Options (for MCQ) */}
                        {requiresOptions && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3" htmlFor="options">Options (Select correct answer)</label>
                                <div className="space-y-3" id="options">
                                    {questionOptions.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleCorrectChange(idx)}
                                                className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                                                    opt.isCorrect 
                                                        ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white scale-105' 
                                                        : 'border-slate-200 text-slate-400 hover:border-green-300 hover:text-green-500 bg-white'
                                                }`}
                                            >
                                                {String.fromCharCode(65 + idx)}
                                            </button>
                                            <Input 
                                                value={opt.text}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                className="flex-1 h-[48px] rounded-xl border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Correct Answer (for non-MCQ) */}
                        {!requiresOptions && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="correct-answer">Correct Answer</label>
                                <Input 
                                    id="correct-answer"
                                    value={correctAnswer}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    placeholder="Enter the correct answer"
                                    className="h-[48px] rounded-xl border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Explanation */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="explanation">Explanation (Optional)</label>
                            <textarea 
                                id="explanation"
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                placeholder="Add an explanation for the answer..."
                                rows={2}
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm text-slate-700 min-h-[80px]"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="shrink-0 border-t border-slate-100 p-5 flex justify-end gap-3 bg-white rounded-b-2xl z-10">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl px-6 h-[42px]">
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        form="create-question-form"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl px-6 h-[42px] shadow-lg shadow-blue-500/25" 
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Creating...
                            </span>
                        ) : 'Create Question'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
