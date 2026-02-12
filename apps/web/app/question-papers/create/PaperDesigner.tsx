'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { getSupabase } from '../../lib/supabase-client';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { 
    Eye, 
    Save, 
    ArrowDown, 
    LayoutTemplate, 
    Search, 
    Trash2, 
    GripVertical, 
    FileText, 
    ChevronDown, 
    ChevronRight,
    Loader2,
    MoveLeft,
    Download
} from 'lucide-react';
import './create.css';
import { RichTextEditor } from './RichTextEditor';

// --- Types ---
interface Question {
    id: string;
    text: string;
    type: string; 
    difficulty: 'easy' | 'medium' | 'hard';
    chapter?: string;
    options?: {
        id: string;
        text: string;
        order: number;
    }[];
    marks?: number;
}

interface PaperSettings {
    title: string;
    chapters: string[];
    duration: string;
    totalMarks: string;
    difficulty: 'easy' | 'mixed' | 'hard';
    
    // Branding & Layout
    institution: string;
    logo: string | null;
    logoPosition: 'left' | 'center' | 'right';
    font: 'jakarta' | 'merriweather' | 'inter' | 'mono';
    template: 'classic' | 'modern' | 'minimal';
    layout: 'single' | 'double';
    margin: 'S' | 'M' | 'L';
    fontSize: number;
    lineHeight: number;
    metaFontSize: number;
    
    // Formatting
    pageBorder: 'none' | 'border-simple' | 'border-double';
    answerSpace: 'none' | 'lines' | 'box';
    separator: 'none' | 'solid' | 'double' | 'dashed';
    
    // Instructions & Content
    date: string;
    instructions: string;
    watermark: string;
    
    // Student Details
    studentName: boolean;
    rollNumber: boolean;
    classSection: boolean;
    dateField: boolean;
    invigilatorSign: boolean;
    studentDetailsGap?: number;

    // Content Alignment
    contentAlignment?: 'left' | 'center' | 'justify';
    
    // Footer
    footerText: string;
    roughWorkArea: 'none' | 'right' | 'bottom';
    pageNumbering: 'page-x-of-y' | 'x-slash-y' | 'hidden';
}

// --- Components ---

const SortableQuestionItem = ({ question, index, onRemove }: { question: Question, index: number, onRemove: (id: string) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="paper-item"
            {...attributes} 
            {...listeners}
        >
            <i className="ri-delete-bin-line remove-item" onClick={(e) => { e.stopPropagation(); onRemove(question.id); }}></i>
            <div className="flex gap-3">
                <span className="font-bold text-slate-900 shrink-0">{index + 1}.</span>
                <div className="flex-1 pr-16">
                    <div 
                        className="font-medium text-slate-900 mb-1 leading-relaxed"
                        style={{ minHeight: '1.2em' }}
                    >
                        {question.text || 'Question Text Missing'}
                        {question.marks ? <span className="float-right font-normal text-slate-500" style={{ fontSize: '0.85em' }}>[{question.marks} marks]</span> : null}
                    </div>
                    {question.options && question.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2" style={{ fontSize: '0.9em' }}>
                             {question.options.map((opt: { id: string; text: string; order: number }, idx) => (
                             {question.options.map((opt: { id: string; text: string; order: number }, idx) => (
                                <div key={opt.id} className="text-slate-600">
                                    <span className="font-semibold mr-1 text-indigo-600">({String.fromCharCode(65 + idx)})</span> 
                                    {opt.text}
                                </div>
                             ))}
                        </div>
                    )}
                </div>
        </div>
        </div>
    );
};

const ChapterSelect = ({ options, selectedChapters, onChange }: { options: { id: string; name: string }[], selectedChapters: string[], onChange: (val: string) => void }) => {
const ChapterSelect = ({ options, selectedChapters, onChange }: { options: { id: string; name: string }[], selectedChapters: string[], onChange: (val: string) => void }) => {
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

    // If chapters are selected, show "Add another chapter", otherwise "Select Chapter"
    // Or just always "Select Chapter" since tags show the current state? 
    // Let's go with "Select Chapter" to be a clear call to action for adding more.
    const placeholderText = "Select Chapter";

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                className={`input-box cursor-pointer flex justify-between items-center ${isOpen ? 'ring-2 ring-indigo-100 border-indigo-500' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-slate-600">{placeholderText}</span>
                <i className={`ri-arrow-down-s-line transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map((opt) => {
                            const isSelected = selectedChapters.includes(opt.name);
                            return (
                                <div 
                                    key={opt.id}
                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex justify-between items-center ${isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                                    onClick={() => {
                                        onChange(opt.name);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{opt.name}</span>
                                    {isSelected && <i className="ri-check-line"></i>}
                                </div>
                            );
                        })}
                        {options.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400 text-center">No chapters found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PaperDesigner() {
    const router = useRouter();
    const { user, loading: authLoading } = useSupabaseAuth();
    
    // --- State ---
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
    const containerRef = useRef<HTMLDivElement>(null);
    const [chaptersList, setChaptersList] = useState<{id: string, name: string}[]>([]);

    const [settings, setSettings] = useState<PaperSettings>({
        title: 'Physics Term End Examination',
        chapters: [],
        duration: '0',
        totalMarks: '0',
        difficulty: 'mixed',
        institution: "St. Xavier's High School",
        logo: null,
        logoPosition: 'right',
        font: 'jakarta',
        template: 'classic',
        layout: 'single',
        margin: 'M',
        fontSize: 14,
        lineHeight: 1.5,
        metaFontSize: 12,
        
        pageBorder: 'none',
        answerSpace: 'none',
        separator: 'none',
        
        date: (new Date().toISOString().split('T')[0]) as string,
        instructions: '<ul><li>All questions are compulsory.</li><li>Calculators are not allowed.</li></ul>',
        watermark: '',
        
        studentName: true,
        rollNumber: true,
        classSection: false,
        dateField: false,
        invigilatorSign: false,
        studentDetailsGap: 12,
        contentAlignment: 'left',
        
        footerText: '',
        roughWorkArea: 'none',
        pageNumbering: 'page-x-of-y'
    });

    const [showBranding, setShowBranding] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showStudent, setShowStudent] = useState(false);
    const [showFooter, setShowFooter] = useState(false);
    const [activeTab, setActiveTab] = useState<'select' | 'auto'>('select');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [priorityChapter, setPriorityChapter] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(75);
    const [zoomLevel, setZoomLevel] = useState(75);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setZoomLevel(70);
            setZoomLevel(80);
        }
    }, []);

    const [paperQuestions, setPaperQuestions] = useState<Question[]>([]);
    const [sourceQuestions, setSourceQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [isExportAlertOpen, setIsExportAlertOpen] = useState(false);
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const searchParams = useSearchParams();
    // --- AI Chat Logic with Streaming ---
    const { object, submit, isLoading: isStreaming } = experimental_useObject({
        api: '/api/ai/generate',
        schema: z.object({
            questions: z.array(z.object({
                id: z.string(),
                text: z.string(),
                type: z.string(),
                difficulty: z.enum(['easy', 'medium', 'hard']),
                marks: z.number().optional(),
                options: z.array(z.object({
                    id: z.string(),
                    text: z.string()
                })).optional()
            }))
        }),
        onFinish: ({ object }) => {
            if (object?.questions) {
                // Finalize the message in chat history
                setChatMessages(prev => {
                    const newHistory = [...prev];
                    const lastMsg = newHistory[newHistory.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                    if (lastMsg && lastMsg.role === 'assistant') {
                    if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content = `I've generated ${object.questions?.length} questions for you. Click on any question to add it to your paper.`;
                        lastMsg.questions = object.questions as Question[];
                    }
                    return newHistory;
                });
            }
        },
        onError: (error) => {
           console.error("Streaming error:", error);
           setChatMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong while generating." }]);
        }
    });

    // --- AI Chat State ---
    const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, questions?: Question[]}>>([
        { role: 'assistant', content: 'Hello! I can help you create questions. Try asking: "Create 5 hard physics questions about thermodynamics".' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
        if (activeTab === 'auto') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeTab]);



    const handleSendMessage = useCallback((text?: string) => {
        const prompt = text || chatInput.trim();
        if (!prompt || isStreaming) return;
        
        setChatInput('');
        
        // Add User Message
        setChatMessages(prev => [...prev, { role: 'user', content: prompt }]);
        
        // Add Placeholder Assistant Message (will be updated by stream)
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'QuestionHive is thinking...', questions: undefined }]);
        
        submit({ prompt });
    }, [chatInput, isStreaming, submit]);

    // --- Auto-Generate from URL ---
    const hasTriggeredAutoRef = useRef(false);
    useEffect(() => {
        const autoQuery = searchParams.get('auto_query');
        if (autoQuery && !hasTriggeredAutoRef.current) {
            hasTriggeredAutoRef.current = true;
            setActiveTab('auto');
            handleSendMessage(autoQuery);
        }
    }, [searchParams]);

    const suggestedPrompts = [
        "Create 3 hard multiple choice questions on Calculus",
        "Generate 5 easy Physics questions about motion",
        "Create questions about Indian History",
        "Generate Chemistry questions for Grade 10"
    ];

    // Sync streaming object to the UI in real-time
    useEffect(() => {
        if (isStreaming && object?.questions) {
            setChatMessages(prev => {
                const newHistory = [...prev];
                const lastMsg = newHistory[newHistory.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = `Generating specific questions... (${object.questions?.length || 0})`;
                    // Cast partial object to Question type (it might have missing fields while streaming)
                    lastMsg.questions = object.questions as unknown as Question[];
                }
                return newHistory;
            });
            
            // Auto-scroll
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [object, isStreaming]); 




    // --- Effects ---
    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login');
    }, [authLoading, user, router]);

    // Fetch Chapters
    useEffect(() => {
        const fetchChapters = async () => {
             // 1. Fetch available chapters for the dropdown
            const supabase = getSupabase();
            const { data } = await supabase.from('chapters').select('id, name');
            if (data) {
                setChaptersList(data);
                
                // 2. Parse URL params for INITIAL selection
                const urlChapters = searchParams.get('chapters')?.split(',').filter(Boolean) || [];
                
                if (urlChapters.length > 0) {
                     setSettings(s => ({...s, chapters: urlChapters}));
                } else if (data.length > 0 && data[0]?.name) {
                     // Default fallback if nothing in URL
                     setSettings(s => ({...s, chapters: [data[0]?.name || '']}));
                }
            }
        };
        fetchChapters();
    }, [searchParams]);

    // Auto-Print Effect
    useEffect(() => {
        if (searchParams.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, [searchParams]);

    // --- Draft Persistence ---
    // 1. Auto-save to LocalStorage
    useEffect(() => {
        const autoSave = async () => {
             // Only auto-save if we have content and user is logged in
            if (!user?.id) return;
            if (settings.chapters.length === 0 && paperQuestions.length === 0 && !settings.title) return;

             // Don't auto-save if we are already explicitly saving
            if (isSaving) return;

            try {
                const savedId = searchParams.get('savedId');
                
                // Construct Payload for Draft
                const safeSettings = {
                    ...debouncedSettings,
                    duration: parseInt(debouncedSettings.duration || '0') || 0,
                    totalMarks: parseInt(debouncedSettings.totalMarks || '0') || 0,
                };

                const payload = {
                    id: savedId, 
                    settings: safeSettings,
                    paperQuestions: debouncedQuestions,
                    status: 'Draft', // Explicitly Draft
                    email: user.email
                };

                // Silent Save (no loading UI blocking)
                const response = await fetch('/api/question-papers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                
                if (result.success && result.paperId) {
                     // Check if ID changed (new draft created)
                    if (!savedId || savedId !== String(result.paperId)) {
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.set('savedId', String(result.paperId));
                        router.replace(`?${newParams.toString()}`, { scroll: false });
                    }
                }

            } catch (err) {
                console.error("Auto-save failed", err);
                // Silent fail for drafts, maybe small indicator later
            }
        };

        autoSave();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSettings, debouncedQuestions]); // Trigger when these stabilize

    
    // 3. Extract subjectId from URL
    useEffect(() => {
        const subjectIdParam = searchParams.get('subjectId');
        if (subjectIdParam) {
            setSubjectId(parseInt(subjectIdParam, 10));
        }
    }, [searchParams]);

    // 4. Load logic - API ONLY
    const savedId = searchParams.get('savedId');
    useEffect(() => {
        const loadPaper = async () => {
            if (!user?.id) return;
        const loadPaper = async () => {
            if (!user?.id) return;

            const savedId = searchParams.get('savedId');

        if (resume) {
            const saved = localStorage.getItem(`current_paper_draft_${user.id}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.settings) setSettings(s => ({...s, ...parsed.settings}));
                    if (parsed.paperQuestions) setPaperQuestions(parsed.paperQuestions);
                } catch (e) { console.error(e); }
            }
        } else if (savedId) {
            const allSaved = localStorage.getItem(`saved_papers_${user.id}`);
            if (allSaved) {
                try {
                    const papers = JSON.parse(allSaved);
                    const found = papers.find((p: { id: string }) => p.id === savedId);
                    if (found) {
                        setSettings(s => ({...s, ...found.settings}));
                        setPaperQuestions(found.paperQuestions);
                    }
                } catch (e) { console.error(e); }
            }
        }
    }, [searchParams, user]);

    const [isSaving, setIsSaving] = useState(false);
    // Removed useToast hook

    const handleSavePaper = async () => {
        if (!settings.title) {
            toast.error("Please enter a paper title");
            return;
        }

        if (!subjectId) {
            toast.error("Please select a subject before saving");
            return;
        }

        setIsSaving(true);
        
        try {
            const savedId = searchParams.get('savedId');
            
            // Construct Payload
            const payload = {
                id: savedId ? parseInt(savedId, 10) : undefined, 
                settings: safeSettings,
                paperQuestions,
                status: 'Saved', // Finalized Status
                email: user?.email,
                subjectId: subjectId
            };

            const response = await fetch('/api/question-papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to save paper');
            }

            // No local storage sync needed anymore

            if (result.paperId && (!savedId || savedId !== String(result.paperId))) {
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.set('savedId', String(result.paperId));
                router.replace(`?${newParams.toString()}`);
            }

            toast.success("Paper saved to database successfully!");

        } catch (error: unknown) {
        } catch (error: unknown) {
            console.error('Save failed:', error);
            toast.error(error.message || "Failed to save paper.");
        } finally {
            setIsSaving(false);
        }
    };


    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchQuestions = async (page: number) => {
            setIsLoadingQuestions(true);
            const supabase = getSupabase();
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const selectedChapters = settings.chapters;
            
            // Use !inner if we need to filter by chapter, otherwise left join is fine
            const chapterSelect = selectedChapters.length > 0 ? 'chapters!inner(name)' : 'chapters(name)';

            if (priorityChapter) {
                // Strategic Two-Step Fetch for Prioritization
                // 1. Fetch lightweight metadata for ALL matching questions to sort fully
                let idQuery = supabase
                    .from('questions')
                    .select('id, difficulty_levels(name), chapters!inner(name)', { count: 'exact' });

                if (selectedChapters.length > 0) {
                    idQuery = idQuery.in('chapters.name', selectedChapters);
                }

                // We can't range here because we need to sort the WHOLE set first
                const { data: allIds, error: idError, count: total } = await idQuery;
                
                if (idError || !allIds) {
                    setIsLoadingQuestions(false);
                    return;
                }

                setTotalCount(total || 0);

                // 2. Sort in memory (Priority -> Difficulty)
                const sortedIds = allIds.sort((a: { id: any; difficulty_levels: { name: any }[]; chapters: { name: any }[] }, b: { id: any; difficulty_levels: { name: any }[]; chapters: { name: any }[] }) => {
                const sortedIds = allIds.sort((a: { id: any; difficulty_levels: { name: any }[]; chapters: { name: any }[] }, b: { id: any; difficulty_levels: { name: any }[]; chapters: { name: any }[] }) => {
                    // Priority Chapter
                    const aIsPriority = a.chapters?.[0]?.name === priorityChapter;
                    const bIsPriority = b.chapters?.[0]?.name === priorityChapter;
                    const aIsPriority = a.chapters?.[0]?.name === priorityChapter;
                    const bIsPriority = b.chapters?.[0]?.name === priorityChapter;
                    if (aIsPriority && !bIsPriority) return -1;
                    if (!aIsPriority && bIsPriority) return 1;

                    // Difficulty
                    const diffWeight: {[k: string]: number} = { 'easy': 1, 'medium': 2, 'hard': 3 };
                    const aWeight = diffWeight[a.difficulty_levels?.[0]?.name?.toLowerCase() || ''] || 4;
                    const bWeight = diffWeight[b.difficulty_levels?.[0]?.name?.toLowerCase() || ''] || 4;
                    const aWeight = diffWeight[a.difficulty_levels?.[0]?.name?.toLowerCase() || ''] || 4;
                    const bWeight = diffWeight[b.difficulty_levels?.[0]?.name?.toLowerCase() || ''] || 4;
                    return aWeight - bWeight;
                });

                // 3. Slice for current page
                const slicedIds = sortedIds.slice(from, to).map(x => x.id);

                if (slicedIds.length === 0) {
                    setSourceQuestions([]);
                    setIsLoadingQuestions(false);
                    return;
                }

                // 4. Fetch full details for sliced IDs
                // Note: We need to preserve the order of slicedIds. 
                // Supabase 'in' does not guarantee order, so we'll need to re-sort or map client side again.
                const { data: fullData, error: fullError } = await supabase
                    .from('questions')
                    .select(`
                        id, 
                        content, 
                        difficulty_levels(name), 
                        question_types(name),
                        chapters(name),
                        question_options(id, option_text, option_order)
                    `)
                    .in('id', slicedIds);

                if (fullData) {
                    // Restore sort order from slicedIds
                    const orderedData = slicedIds.map(id => fullData.find(d => d.id === id)).filter(Boolean);
                    
                     // Transform
                     const transformed = orderedData.map(q => ({
                        id: q?.id,
                        text: q?.content,
                        type: q?.question_types?.[0]?.name,
                        difficulty: q?.difficulty_levels?.[0]?.name,
                        chapter: q?.chapters?.[0]?.name,
                        options: q?.question_options?.map(o => ({
                            id: o.id,
                            text: o.option_text,
                            order: o.option_order
                        })).sort((a, b) => a.order - b.order)
                        })).sort((a, b) => a.order - b.order)
                    }));
                    setSourceQuestions(transformed);
                    setHasMore(transformed.length === PAGE_SIZE);
                }

            } else {
                // Standard Pagination (Previous Logic)
                let query = supabase
                    .from('questions')
                    .select(`
                        id, 
                        content, 
                        difficulty_levels(name), 
                        question_types(name),
                        ${chapterSelect},
                        question_options(id, option_text, option_order)
                    `, { count: 'exact' });

                if (selectedChapters.length > 0) {
                    query = query.in('chapters.name', selectedChapters);
                }

                const { data, error, count } = await query.range(from, to);

                if (error) {
                    console.error('Error fetching questions:', error);
                }
                
                if (count !== null) setTotalCount(count);

                if (data) {
                    // Transform Data
                    const transformed = data.map((q) => ({
                    const transformed = data.map((q) => ({
                        id: q.id,
                        text: q.content,
                        type: q.question_types?.[0]?.name,
                        difficulty: q.difficulty_levels?.[0]?.name,
                        chapter: q.chapters?.[0]?.name,
                        options: q.question_options?.map((o) => ({
                            id: o.id,
                            text: o.option_text,
                            order: o.option_order
                        })).sort((a, b) => a.order - b.order)
                        })).sort((a, b) => a.order - b.order)
                    }));
                    setSourceQuestions(transformed);
                    setHasMore(transformed.length === PAGE_SIZE);
                }
            }


            setIsLoadingQuestions(false);
        };
        fetchQuestions(currentPage);
    }, [currentPage, settings.chapters, priorityChapter]);



    // --- Drag Handlers ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setPaperQuestions((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- Layout Resizing ---
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleResizeMouseUp);
        document.body.style.cursor = 'col-resize';
    };
    
    // Using any to avoid complicated mouse event types across browser/React
    const handleResizeMouseMove = (e: MouseEvent) => {
    const handleResizeMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const newLeftWidth = ((e.clientX - containerRef.current.getBoundingClientRect().left) / containerWidth) * 100;
            if (newLeftWidth > 20 && newLeftWidth < 80) setLeftPanelWidth(newLeftWidth);
        }
    };

    const handleResizeMouseUp = () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
        document.body.style.cursor = 'default';
    };

    // --- Actions ---
    const addToPaper = (q: Question) => {
        if (!paperQuestions.find(item => item.id === q.id)) {
            setPaperQuestions([...paperQuestions, q]);
            
            // Auto-calculate metrics: 1 Q = 4 Marks, 1 Min
            const currentMarks = parseInt(settings.totalMarks) || 0;
            const currentDuration = parseInt(settings.duration) || 0;
            
            // Set default layout and border when first question is added
            const isFirstQuestion = paperQuestions.length === 0;
            
            // Set default layout and border when first question is added
            const isFirstQuestion = paperQuestions.length === 0;
            
            setSettings({
                ...settings,
                totalMarks: String(currentMarks + 4),
                duration: String(currentDuration + 1),
                // Apply defaults on first question add
                ...(isFirstQuestion && {
                    layout: '2-col',
                    pageBorder: 'simple'
                })
                duration: String(currentDuration + 1),
                // Apply defaults on first question add
                ...(isFirstQuestion && {
                    layout: '2-col',
                    pageBorder: 'simple'
                })
            });
        }
    };

    // Filter questions client-side based on search and difficulty
    const filteredQuestions = useMemo(() => {
        return sourceQuestions.filter(q => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = q.text.toLowerCase().includes(query) || 
                                (q.chapter && q.chapter.toLowerCase().includes(query));
            
            const matchesChapter = settings.chapters.length > 0 
                ? (q.chapter && settings.chapters.includes(q.chapter))
                : true;

            const matchesDifficulty = settings.difficulty === 'mixed' 
                ? true 
                : q.difficulty === settings.difficulty;

            return matchesSearch && matchesDifficulty && matchesChapter;
        }).sort((a, b) => {
            // 1. Priority Chapter
            if (priorityChapter) {
                const aIsPriority = a.chapter === priorityChapter;
                const bIsPriority = b.chapter === priorityChapter;
                if (aIsPriority && !bIsPriority) return -1;
                if (!aIsPriority && bIsPriority) return 1;
            }

            // 2. Difficulty (Easy -> Medium -> Hard)
            const diffWeight: {[k: string]: number} = { 'easy': 1, 'medium': 2, 'hard': 3 };
            const aWeight = diffWeight[a.difficulty?.toLowerCase() || ''] || 4;
            const bWeight = diffWeight[b.difficulty?.toLowerCase() || ''] || 4;
            
            return aWeight - bWeight;
        });
    }, [sourceQuestions, searchQuery, settings.difficulty, settings.chapters, priorityChapter]);

    const removeFromPaper = (id: string) => {
        setPaperQuestions(paperQuestions.filter(q => q.id !== id));
        
        // Auto-calculate metrics
        const currentMarks = parseInt(settings.totalMarks) || 0;
        const currentDuration = parseInt(settings.duration) || 0;
        
        setSettings({
            ...settings,
            totalMarks: String(Math.max(0, currentMarks - 4)),
            duration: String(Math.max(0, currentDuration - 1))
        });
    };




    // --- Logo Upload ---
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(s => ({...s, logo: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- PDF Export Function using Puppeteer API ---
    // --- PDF Export Function using Puppeteer API ---
    const handleExportPDF = async () => {
        if (paperQuestions.length === 0) {
            toast.error('No questions to export', {
                description: 'Please add some questions to your paper first.'
            });
            return;
        }
        
        const cost = paperQuestions.length;
        const currentCredits = user?.credits || 0;

        if (currentCredits < cost) {
            toast.error('Insufficient Credits', {
                description: `You need ${cost} credits but have only ${currentCredits}. Please purchase more.`
            });
            return;
        }

        setIsExportAlertOpen(true);
    };

    const processExport = async () => {
        // Validation handled by click handler
        if (paperQuestions.length === 0) return;

        try {
            // First, trigger a save to ensure the DB record matches the export
            toast.info('Saving changes before export...', { duration: 2000 });
            
            const savedId = searchParams.get('savedId');
            const safeSettings = {
                ...settings,
                duration: parseInt(settings.duration || '0') || 0,
                totalMarks: parseInt(settings.totalMarks || '0') || 0,
            };

            const savePayload = {
                id: savedId, 
                settings: safeSettings,
                paperQuestions,
                status: 'Saved', 
                email: user?.email 
            };

            const saveRes = await fetch('/api/question-papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload)
            });

            if (!saveRes.ok) {
                console.warn("Pre-export save failed, continuing with export anyway.");
            } else {
                const saveResult = await saveRes.json();
                if (saveResult.paperId && (!savedId || savedId !== String(saveResult.paperId))) {
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('savedId', String(saveResult.paperId));
                    router.replace(`?${newParams.toString()}`, { scroll: false });
                }
            }

            // First, trigger a save to ensure the DB record matches the export
            toast.info('Saving changes before export...', { duration: 2000 });
            
            const savedId = searchParams.get('savedId');
            const safeSettings = {
                ...settings,
                duration: parseInt(settings.duration || '0') || 0,
                totalMarks: parseInt(settings.totalMarks || '0') || 0,
            };

            const savePayload = {
                id: savedId, 
                settings: safeSettings,
                paperQuestions,
                status: 'Saved', 
                email: user?.email 
            };

            const saveRes = await fetch('/api/question-papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload)
            });

            if (!saveRes.ok) {
                console.warn("Pre-export save failed, continuing with export anyway.");
            } else {
                const saveResult = await saveRes.json();
                if (saveResult.paperId && (!savedId || savedId !== String(saveResult.paperId))) {
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('savedId', String(saveResult.paperId));
                    router.replace(`?${newParams.toString()}`, { scroll: false });
                }
            }

            toast.info('Generating PDF...', {
                description: 'This may take a few seconds.'
            });

            // Prepare data for the API
            const paperData = {
                data: {
                    title: settings.title,
                    institution: settings.institution,
                    duration: settings.duration,
                    totalMarks: settings.totalMarks,
                    template: settings.template,
                    font: settings.font,
                    fontSize: settings.fontSize,
                    margin: settings.margin,
                    
                    // New Branding Fields
                    logo: settings.logo,
                    logoPosition: settings.logoPosition,
                    layout: settings.layout,
                    lineHeight: settings.lineHeight,
                    answerSpace: settings.answerSpace,
                    separator: settings.separator,
                    pageBorder: settings.pageBorder,
                    metaFontSize: settings.metaFontSize,

                date: settings.date,
                instructions: settings.instructions,
                contentAlignment: settings.contentAlignment,
                watermark: settings.watermark,
                studentName: settings.studentName,
                rollNumber: settings.rollNumber,
                classSection: settings.classSection,
                dateField: settings.dateField,
                invigilatorSign: settings.invigilatorSign,
                studentDetailsGap: settings.studentDetailsGap,
                footerText: settings.footerText,
                roughWorkArea: settings.roughWorkArea,
                pageNumbering: settings.pageNumbering,
                questions: paperQuestions.map(q => ({
                    id: q.id,
                    text: q.text,
                    marks: q.marks,
                    options: q.options?.map(opt => ({
                        id: opt.id,
                        text: opt.text
                    }))
                }))
            };

            // Call the Puppeteer API
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paperData),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to generate PDF';
                try {
                    const errData = await response.json();
                    errorMessage = errData.error || errorMessage;
                } catch (e) {
                    errorMessage = response.statusText || errorMessage;
                }
                
                // Special handling for insufficient credits
                if (response.status === 403) {
                     // logic handled above if it was JSON, but let's re-parse or trust the error message?
                     // Actually, if 403, we might have already parsed it.
                     // optimizing...
                }
                 // If it was 403 and we got JSON, we already have the info. 
                 // But let's simplify the existing block to be more robust.
            }
            

            if (!response.ok) {
                let errorMessage = 'Failed to generate PDF';
                try {
                    const errData = await response.json();
                    errorMessage = errData.error || errorMessage;
                } catch (e) {
                    errorMessage = response.statusText || errorMessage;
                }
                
                // Special handling for insufficient credits
                if (response.status === 403) {
                     // logic handled above if it was JSON, but let's re-parse or trust the error message?
                     // Actually, if 403, we might have already parsed it.
                     // optimizing...
                }
                 // If it was 403 and we got JSON, we already have the info. 
                 // But let's simplify the existing block to be more robust.
            }
            
            if (!response.ok) {
                 const errData = await response.json().catch(() => ({}));
                 
                 const errData = await response.json().catch(() => ({}));
                 
                // Special handling for insufficient credits
                if (response.status === 403) {
                    toast.info(errData.error || 'Thank you for using the beta version', {
                        description: errData.requiredCredits 
                            ? `Required: ${errData.requiredCredits} credits | Available: ${errData.availableCredits} credits`
                            : undefined,
                        duration: 5000
                    });
                    return; // Don't throw error, just show message
                }

                throw new Error(errData.error || response.statusText || 'Failed to generate PDF');

                throw new Error(errData.error || response.statusText || 'Failed to generate PDF');
            }

            // Get the PDF blob
            const pdfBlob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${settings.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF Downloaded!', {
                description: 'Your paper has been saved successfully.'
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Export failed', {
                description: 'There was an error generating the PDF. Please try again.'
            });
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
    const handleZoomReset = () => setZoomLevel(100);

    const paginateQuestions = (questions: Question[]) => {
        if (questions.length === 0) return [];

        const pages: Question[][] = [];
        let currentPage: Question[] = [];
        
        // A4 in mm: 210 × 297mm
        // Converting to approximate px at 96dpi: 1mm ≈ 3.78px
        const MM_TO_PX = 3.78;
        const PAGE_HEIGHT_MM = 297;
        const PAGE_HEIGHT = PAGE_HEIGHT_MM * MM_TO_PX; // ~1122px
        const MARGIN_MM = 10; // 10mm padding we set in CSS
        const MARGIN = MARGIN_MM * MM_TO_PX;
        
        const HEADER_HEIGHT = 100; // Title, meta, institution (smaller estimate)
        const FOOTER_HEIGHT = 40; // Page number footer
        
        let availableHeight = PAGE_HEIGHT - (2 * MARGIN) - HEADER_HEIGHT - FOOTER_HEIGHT;
        let currentHeight = 0;

        questions.forEach((q) => {
            // More accurate height estimation
            const fontSize = settings.fontSize;
            const lineHeight = fontSize * 1.4;
            
            // Estimate question text lines (more generous chars per line)
            const charsPerLine = 70; // Approximate for A4 width
            const textLines = Math.ceil(q.text.length / charsPerLine);
            const textHeight = Math.max(textLines, 1) * lineHeight;
            
            // Options height (2 columns, so divide by 2)
            let optionsHeight = 0;
            if (q.options && q.options.length > 0) {
                const optsRows = Math.ceil(q.options.length / 2);
                optionsHeight = optsRows * 20; // ~20px per row
            }

            // Item height = text + options + padding (reduced from 30 to 20)
            const itemHeight = textHeight + optionsHeight + 20;

            if (currentHeight + itemHeight > availableHeight) {
                // Push current page and start new
                pages.push(currentPage);
                currentPage = [];
                currentHeight = 0;
                // Subsequent pages have more space (no header)
                availableHeight = PAGE_HEIGHT - (2 * MARGIN) - 30 - FOOTER_HEIGHT;
            }

            currentPage.push(q);
            currentHeight += itemHeight;
        });

        if (currentPage.length > 0) pages.push(currentPage);
        
        return pages;
    };

    const PaperContent = () => {
        const marginPx = getMargins();
        const fontFamily = getFontFamily();
        const pages = paginateQuestions(paperQuestions);

        if (paperQuestions.length === 0) {
            return (
                <div 
                    className={`paper-sheet ${settings.template === 'modern' ? 't-modern' : settings.template === 'minimal' ? 't-minimal' : 't-classic'}`}
                    style={{ 
                        fontFamily,
                        padding: `${marginPx}px`,
                        fontSize: `${settings.fontSize}px`,
                        marginBottom: '40px'
                    }}
                >
                     <div className="paper-header">
                        <div className="p-institution" style={{display: settings.institution ? 'block' : 'none'}}>{settings.institution}</div>
                        <div className="p-title">{settings.title}</div>
                        <div className="p-meta">
                            <span>Duration: {settings.duration}</span>
                            <span>Max Marks: {settings.totalMarks}</span>
                        </div>
                    </div>
                    <div style={{textAlign: 'center', color: '#cbd5e1', marginTop: '50px'}}>
                        <i className="ri-drag-move-2-line" style={{fontSize: '32px', marginBottom: '10px', display: 'block'}}></i>
                        Click or drag questions to add here
                    </div>
                </div>
            )
        }

        let globalIndex = 0;

    return (
        <DashboardLayout fullScreen={true}>
            <div 
                className={`main-container ${mobileTab === 'editor' ? 'editor-full' : 'preview-full'}`} 
                ref={containerRef as React.RefObject<HTMLDivElement>}
            >
            <div className={`main-container ${mobileTab === 'editor' ? 'editor-full' : 'preview-full'}`} ref={containerRef as React.RefObject<HTMLDivElement>}>
                
                <div 
                    className={`editor-panel ${mobileTab === 'editor' ? 'block' : 'hidden'} lg:block`} 
                    style={{ '--left-width': `${leftPanelWidth}%` } as React.CSSProperties} 
                    data-lenis-prevent
                >
                    <div className="editor-header sticky top-0 z-20 bg-white -mt-4 -mx-4 pt-1 px-4 lg:-mt-8 lg:-mx-8 lg:pt-1 lg:px-8 pb-4 border-b border-slate-100/80 backdrop-blur-sm shadow-sm transition-all duration-200">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => router.back()} className="p-1 hover:bg-slate-100 rounded-full">
                                    <i className="ri-arrow-left-line text-slate-500" style={{fontSize: '18px'}}></i>
                    <div className="editor-header sticky top-0 z-20 bg-white/80 -mt-4 -mx-4 pt-4 px-4 lg:-mt-8 lg:-mx-8 lg:pt-4 lg:px-8 pb-3 border-b border-slate-100/80 backdrop-blur-md shadow-sm transition-all duration-200">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
                                    <i className="ri-arrow-left-line text-slate-700" style={{fontSize: '20px'}}></i>
                                </button>
                                <h1>Paper Designer</h1>
                            </div>
                            <div className="breadcrumbs">Home / {settings.chapters.join(', ')} / {settings.title}</div>
                        </div>
                        <div className="header-actions">
                            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl mr-2">
                                <button 
                                    onClick={() => setMobileTab('editor')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mobileTab === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Editor
                                <div className="min-w-0">
                                    <h1 className="text-lg lg:text-2xl font-bold truncate">{settings.title || 'Paper Designer'}</h1>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                        <span className="flex items-center gap-1"><i className="ri-folder-open-line"></i> {settings.chapters.length} Chapters</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="flex items-center gap-1"><i className="ri-question-line"></i> {paperQuestions.length} Qs</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">

                                
                                <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 lg:hidden" onClick={handleSavePaper} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <i className="ri-save-line text-lg"></i>}
                                </button>
                                
                                <button className="btn-action hidden lg:flex" onClick={handleSavePaper} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <i className="ri-save-line"></i>}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                            <button className="btn-action hidden lg:flex" onClick={() => setShowPreviewModal(true)}><i className="ri-eye-line"></i> Popout</button>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
                                <button className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors" onClick={handleZoomOut} title="Zoom Out">
                                    <i className="ri-subtract-line"></i>
                                </button>
                                <span className="text-xs font-bold w-10 text-center text-slate-700">{zoomLevel}%</span>
                                <button className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors" onClick={handleZoomIn} title="Zoom In">
                                    <i className="ri-add-line"></i>
                                </button>
                                <div className="w-px h-3 bg-slate-300 mx-1"></div>
                                <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600 text-[10px] font-semibold transition-colors uppercase tracking-wider" onClick={handleZoomReset}>
                                    Reset
                                </button>
                            </div>
                            <button className="btn-action" onClick={handleSavePaper} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <i className="ri-save-line"></i>}
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <div className="settings-card">
                        
                        <div className="row">
                            <div className="col" style={{flex: 1}}>
                                <label>Paper Title</label>
                                <input type="text" className="input-box" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} />
                            </div>
                            <div className="col">
                                <label>Chapter</label>
                                <ChapterSelect 
                                    options={chaptersList} 
                                    selectedChapters={settings.chapters}
                                    onChange={(val) => {
                                        if (!settings.chapters.includes(val)) {
                                            setSettings(s => ({...s, chapters: [...s.chapters, val]}));
                                            setCurrentPage(1);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                    <SettingsForm 
                        settings={settings} 
                        setSettings={setSettings} 
                        chaptersList={chaptersList} 
                        setCurrentPage={setCurrentPage} 
                        handleLogoUpload={handleLogoUpload}
                        showBranding={showBranding}
                        setShowBranding={setShowBranding}
                        showInstructions={showInstructions}
                        setShowInstructions={setShowInstructions}
                        showStudent={showStudent}
                        setShowStudent={setShowStudent}
                        showFooter={showFooter}
                        setShowFooter={setShowFooter}
                    />

                    <div className="tab-group">
                        <div className={`tab ${activeTab === 'select' ? 'active' : ''}`} onClick={() => setActiveTab('select')}>Select Questions</div>
                        <div className={`tab ${activeTab === 'auto' ? 'active' : ''}`} onClick={() => setActiveTab('auto')}>Auto-Generate</div>
                    </div>

                    {activeTab === 'select' ? (
                        <QuestionList
                            settings={settings}
                            setSettings={setSettings}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            priorityChapter={priorityChapter}
                            setPriorityChapter={setPriorityChapter}
                            setCurrentPage={setCurrentPage}
                            isLoadingQuestions={isLoadingQuestions}
                            filteredQuestions={filteredQuestions}
                            paperQuestions={paperQuestions}
                            addToPaper={addToPaper}
                            currentPage={currentPage}
                            totalCount={totalCount}
                            hasMore={hasMore}
                            PAGE_SIZE={PAGE_SIZE}
                        />
                    ) : (
                        <AIChatInterface
                            chatMessages={chatMessages}
                            isStreaming={isStreaming}
                            object={object}
                            paperQuestions={paperQuestions}
                            addToPaper={addToPaper}
                            chatInput={chatInput}
                            setChatInput={setChatInput}
                            handleSendMessage={handleSendMessage}
                            chatEndRef={chatEndRef}
                        />
                    )}

                </div>

                {/* Mobile View Toggle Button */}
                <button 
                    className="lg:hidden fixed bottom-20 right-6 bg-white text-indigo-600 border border-indigo-200 px-4 py-2.5 rounded-full shadow-lg z-30 flex items-center gap-2 font-semibold active:scale-95 transition-all"
                    onClick={() => setMobileTab(mobileTab === 'editor' ? 'preview' : 'editor')}
                >
                    {mobileTab === 'editor' ? (
                        <><i className="ri-eye-line text-lg"></i> Preview</>
                    ) : (
                        <><i className="ri-edit-line text-lg"></i> Editor</>
                    )}
                </button>

                <div className={`resizer hidden lg:flex`} onMouseDown={handleResizeMouseDown}></div>

                <PreviewPanel 
                    mobileTab={mobileTab}
                    zoomLevel={zoomLevel}
                    settings={settings}
                    paperQuestions={paperQuestions}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onRemoveQuestion={removeFromPaper}
                    handleExportClick={handleExportClick}
                />
                <div className={`resizer hidden lg:flex`} onMouseDown={handleResizeMouseDown}></div>

                <div
                    className="preview-panel"
                    data-lenis-prevent
                    style={{
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: zoomLevel <= 100 ? 'flex-start' : 'center'
                    }}
                >

                    <div className={`flex-1 bg-slate-50/50 p-8 flex overflow-auto ${zoomLevel <= 100 ? 'justify-start' : 'justify-center'}`}>
                        <div
                            style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: 'top left',
                                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                minHeight: '100%'
                            }}
                        >
                            <PaperContent />
                        </div>
                    </div>
                    
                    <button className="fab-export" onClick={handleExportClick}><i className="ri-file-pdf-line"></i> Export PDF</button>
                </div>

                <AlertDialog open={isExportAlertOpen} onOpenChange={setIsExportAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                            <AlertDialogDescription>
                                This export will consume <span className="font-bold text-indigo-600">{paperQuestions.length} credits</span> from your balance.
                                <br />
                                Are you sure you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4 px-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.withAnswerKey || false}
                                    onChange={(e) => setSettings(s => ({ ...s, withAnswerKey: e.target.checked }))}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Include Answer Key PDF
                                </span>
                            </label>
                            {settings.withAnswerKey && (
                                <p className="text-xs text-gray-500 mt-2">
                                    ✓ Both Question Paper and Answer Key will be downloaded as a ZIP file
                                </p>
                            )}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={processExport}>Confirm Export</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className={`modal-overlay ${showPreviewModal ? 'active' : ''}`}>
                    <div className="close-modal" onClick={() => setShowPreviewModal(false)}><i className="ri-close-circle-line"></i></div>
                    <div className="modal-content">
                        <div style={{ pointerEvents: 'none', transform: 'scale(1)', transformOrigin: 'top center' }}>
                            <PaperContent 
                                settings={settings}
                                paperQuestions={paperQuestions}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                                onRemoveQuestion={removeFromPaper}
                            />
                            <PaperContent 
                                settings={settings}
                                paperQuestions={paperQuestions}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                                onRemoveQuestion={removeFromPaper}
                            />
                        </div>
                    </div>
                </div>

            </div>



            {/* Floating Export Button for Mobile & Desktop - Fixed at Bottom */}
            <button 
                onClick={handleExportClick}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-xl z-40 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                title="Export PDF"
            >
                <i className="ri-file-pdf-line text-xl"></i>
                <span className="font-semibold">Export PDF</span>
            </button>


            {/* Floating Export Button for Mobile & Desktop - Fixed at Bottom */}
            <button 
                onClick={handleExportClick}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-xl z-40 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                title="Export PDF"
            >
                <i className="ri-file-pdf-line text-xl"></i>
                <span className="font-semibold">Export PDF</span>
            </button>

            {/* Mobile View Toggle (Fixed Above Bottom Nav) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white backdrop-blur-md px-1 py-1 rounded-full shadow-xl z-50 flex items-center gap-0.5 border border-slate-700/50">
            {/* Mobile View Toggle (Fixed Above Bottom Nav) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white backdrop-blur-md px-1 py-1 rounded-full shadow-xl z-50 flex items-center gap-0.5 border border-slate-700/50">
                <button 
                    onClick={() => setMobileTab('editor')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutTemplate size={14} />
                    Editor
                </button>
                <button 
                    onClick={() => setMobileTab('preview')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Eye size={14} />
                    Preview
                </button>
            </div>
        </DashboardLayout>
    );
}
