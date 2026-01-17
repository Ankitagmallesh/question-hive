'use client';

import { useState, useEffect } from 'react';
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

export default function CreateQuestionModal({ isOpen, onClose, onSuccess, userId }: CreateQuestionModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Dropdown data
    const [exams, setExams] = useState<Exam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
    
    // Form state
    const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [selectedDifficultyId, setSelectedDifficultyId] = useState<number | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [content, setContent] = useState('');
    const [marks, setMarks] = useState(1);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [explanation, setExplanation] = useState('');
    const [options, setOptions] = useState<Option[]>([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);

    // Load initial dropdown data
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    // Load subjects when exam changes
    useEffect(() => {
        if (selectedExamId) {
            loadSubjects(selectedExamId);
            setSelectedSubjectId(null);
            setSelectedChapterId(null);
            setSubjects([]);
            setChapters([]);
        }
    }, [selectedExamId]);

    // Load chapters when subject changes
    useEffect(() => {
        if (selectedSubjectId) {
            loadChapters(selectedSubjectId);
            setSelectedChapterId(null);
            setChapters([]);
        }
    }, [selectedSubjectId]);

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
                if (mcqType) setSelectedTypeId(mcqType.id);
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

    const selectedType = questionTypes.find(t => t.id === selectedTypeId);
    const requiresOptions = selectedType?.requiresOptions || selectedType?.code?.toLowerCase() === 'mcq';

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        const opt = newOptions[index];
        if (opt) {
            opt.text = text;
            setOptions(newOptions);
        }
    };

    const handleCorrectChange = (index: number) => {
        const newOptions = options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!content.trim()) {
            toast({ title: 'Error', description: 'Question content is required', variant: 'destructive' });
            return;
        }
        if (!selectedChapterId) {
            toast({ title: 'Error', description: 'Please select Exam, Subject, and Chapter', variant: 'destructive' });
            return;
        }
        if (!selectedDifficultyId) {
            toast({ title: 'Error', description: 'Please select a difficulty level', variant: 'destructive' });
            return;
        }
        if (!selectedTypeId) {
            toast({ title: 'Error', description: 'Please select a question type', variant: 'destructive' });
            return;
        }

        // Build correct answer for MCQ
        let finalCorrectAnswer = correctAnswer;
        if (requiresOptions) {
            const correctIndex = options.findIndex(o => o.isCorrect);
            finalCorrectAnswer = String.fromCharCode(65 + correctIndex); // A, B, C, D
        }

        setLoading(true);
        try {
            const res = await fetch('/api/questions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    chapterId: selectedChapterId,
                    difficultyLevelId: selectedDifficultyId,
                    questionTypeId: selectedTypeId,
                    marks,
                    correctAnswer: finalCorrectAnswer,
                    explanation,
                    options: requiresOptions ? options.filter(o => o.text.trim()) : undefined,
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
        setSelectedExamId(null);
        setSelectedSubjectId(null);
        setSelectedChapterId(null);
        setSelectedDifficultyId(null);
        setOptions([
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Create New Question</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Cascading Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Examination *</label>
                            <select 
                                value={selectedExamId || ''} 
                                onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">Select Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject *</label>
                            <select 
                                value={selectedSubjectId || ''} 
                                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-100"
                                disabled={!selectedExamId}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chapter *</label>
                            <select 
                                value={selectedChapterId || ''} 
                                onChange={(e) => setSelectedChapterId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-100"
                                disabled={!selectedSubjectId}
                            >
                                <option value="">Select Chapter</option>
                                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Question Type & Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question Type *</label>
                            <select 
                                value={selectedTypeId || ''} 
                                onChange={(e) => setSelectedTypeId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">Select Type</option>
                                {questionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty *</label>
                            <select 
                                value={selectedDifficultyId || ''} 
                                onChange={(e) => setSelectedDifficultyId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">Select Difficulty</option>
                                {difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marks *</label>
                            <Input 
                                type="number" 
                                min={1} 
                                value={marks} 
                                onChange={(e) => setMarks(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Question Content */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question *</label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your question here..."
                            rows={3}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Options (for MCQ) */}
                    {requiresOptions && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Options (Select correct answer)</label>
                            <div className="space-y-2">
                                {options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleCorrectChange(idx)}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors ${
                                                opt.isCorrect 
                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                    : 'border-slate-300 text-slate-500 hover:border-green-400'
                                            }`}
                                        >
                                            {String.fromCharCode(65 + idx)}
                                        </button>
                                        <Input 
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Correct Answer (for non-MCQ) */}
                    {!requiresOptions && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correct Answer</label>
                            <Input 
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                placeholder="Enter the correct answer"
                            />
                        </div>
                    )}

                    {/* Explanation */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Explanation (Optional)</label>
                        <textarea 
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Add an explanation for the answer..."
                            rows={2}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Question'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
