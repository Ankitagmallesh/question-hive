'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { getSupabase } from '../../lib/supabase-client';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AppLoader from '../../../components/ui/AppLoader';
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
import { useDebounce } from '../../hooks/useDebounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

// --- Types ---
interface Question {
    id: string;
    instanceId?: string;
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
    isAiGenerated?: boolean;
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
    } = useSortable({ id: question.instanceId || question.id });

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
            <i className="ri-delete-bin-line remove-item" onClick={(e) => { e.stopPropagation(); onRemove(question.instanceId || question.id); }}></i>
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
                             {question.options.map((opt, idx) => (
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

const ChapterSelect = ({ options, selectedChapters, onChange }: { options: any[], selectedChapters: string[], onChange: (val: string) => void }) => {
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
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
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
        
        date: new Date().toISOString().split('T')[0],
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
    const [zoomLevel, setZoomLevel] = useState(100);

    const [paperQuestions, setPaperQuestions] = useState<Question[]>([]);
    const [sourceQuestions, setSourceQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [isExportAlertOpen, setIsExportAlertOpen] = useState(false);
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
                    if (lastMsg.role === 'assistant') {
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



    const handleSendMessage = (text?: string) => {
        const prompt = text || chatInput.trim();
        if (!prompt || isStreaming) return;
        
        setChatInput('');
        
        // Add User Message
        setChatMessages(prev => [...prev, { role: 'user', content: prompt }]);
        
        // Add Placeholder Assistant Message (will be updated by stream)
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'QuestionHive is thinking...', questions: undefined }]);
        
        submit({ prompt });
    };

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

    // Auto-Select Tab from URL
    useEffect(() => {
        if (searchParams.get('mode') === 'auto') {
            setActiveTab('auto');
        }
    }, [searchParams]);

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

    // --- Draft Persistence (DB-Only) ---
    // 1. Debounce Changes
    const debouncedSettings = useDebounce(settings, 1500); 
    const debouncedQuestions = useDebounce(paperQuestions, 1500);
    
    // 2. Auto-Save Effect
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

    
    // 3. Load logic - API ONLY
    useEffect(() => {
        const loadPaper = async () => {
            if (!user?.id) return;

            const savedId = searchParams.get('savedId');
            if (!savedId) return;

            try {
                const res = await fetch(`/api/question-papers/${savedId}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.paper) {
                        setSettings(s => ({ ...s, ...json.paper.settings }));
                        setPaperQuestions(json.paper.paperQuestions);
                    }
                }
            } catch (e) {
                console.error("Failed to load paper from API", e);
                toast.error("Could not load the saved paper.");
            }
        };

        loadPaper();
    }, [searchParams.get('savedId'), user]); // Only reload if ID changes or user changes

    const [isSaving, setIsSaving] = useState(false);

    const handleSavePaper = async () => {
        if (!settings.title) {
            toast.error("Please enter a paper title");
            return;
        }

        setIsSaving(true);
        
        try {
            const savedId = searchParams.get('savedId');
            
            const safeSettings = {
                ...settings,
                duration: parseInt(settings.duration || '0') || 0,
                totalMarks: parseInt(settings.totalMarks || '0') || 0,
            };

            const payload = {
                id: savedId, 
                settings: safeSettings,
                paperQuestions,
                status: 'Saved', // Finalized Status
                email: user?.email 
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

            toast.success("Paper saved successfully!");

        } catch (error: any) {
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
                    .select(`id, difficulty_levels(name), chapters!inner(name)`, { count: 'exact' });

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
                const sortedIds = allIds.sort((a: any, b: any) => {
                    // Priority Chapter
                    const aIsPriority = a.chapters?.name === priorityChapter;
                    const bIsPriority = b.chapters?.name === priorityChapter;
                    if (aIsPriority && !bIsPriority) return -1;
                    if (!aIsPriority && bIsPriority) return 1;

                    // Difficulty
                    const diffWeight: {[k: string]: number} = { 'easy': 1, 'medium': 2, 'hard': 3 };
                    const aWeight = diffWeight[a.difficulty_levels?.name?.toLowerCase() || ''] || 4;
                    const bWeight = diffWeight[b.difficulty_levels?.name?.toLowerCase() || ''] || 4;
                    return aWeight - bWeight;
                });

                // 3. Slice for current page
                const slicedIds = sortedIds.slice(from, to).map((x: any) => x.id);

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
                     const transformed = orderedData.map((q: any) => ({
                        id: q.id,
                        text: q.content,
                        type: q.question_types?.name,
                        difficulty: q.difficulty_levels?.name,
                        chapter: q.chapters?.name,
                        options: q.question_options?.map((o: any) => ({
                            id: o.id,
                            text: o.option_text,
                            order: o.option_order
                        })).sort((a: any, b: any) => a.order - b.order)
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
                    const transformed = data.map((q: any) => ({
                        id: q.id,
                        text: q.content,
                        type: q.question_types?.name,
                        difficulty: q.difficulty_levels?.name,
                        chapter: q.chapters?.name,
                        options: q.question_options?.map((o: any) => ({
                            id: o.id,
                            text: o.option_text,
                            order: o.option_order
                        })).sort((a: any, b: any) => a.order - b.order)
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
                const oldIndex = items.findIndex(i => (i.instanceId || i.id) === active.id);
                const newIndex = items.findIndex(i => (i.instanceId || i.id) === over?.id);
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
    const handleResizeMouseMove = (e: any) => {
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
            const questionWithInstance = {
                ...q,
                instanceId: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            setPaperQuestions([...paperQuestions, questionWithInstance]);
            
            // Auto-calculate metrics: 1 Q = 4 Marks, 1 Min
            const currentMarks = parseInt(settings.totalMarks) || 0;
            const currentDuration = parseInt(settings.duration) || 0;
            
            setSettings({
                ...settings,
                totalMarks: String(currentMarks + 4),
                duration: String(currentDuration + 1)
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

    const removeFromPaper = (idOrInstanceId: string) => {
        setPaperQuestions(paperQuestions.filter(q => (q.instanceId || q.id) !== idOrInstanceId));
        
        // Auto-calculate metrics
        const currentMarks = parseInt(settings.totalMarks) || 0;
        const currentDuration = parseInt(settings.duration) || 0;
        
        setSettings({
            ...settings,
            totalMarks: String(Math.max(0, currentMarks - 4)),
            duration: String(Math.max(0, currentDuration - 1))
        });
    };

    // --- Ren Logic ---
    const getMargins = () => {
        switch(settings.margin) {
            case 'S': return 24;
            case 'M': return 48;
            case 'L': return 72;
            default: return 48;
        }
    };

    const getFontFamily = () => {
        return settings.font === 'jakarta' ? "'Plus Jakarta Sans', sans-serif" : "'Merriweather', serif";
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
    const handleExportClick = () => {
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
            toast.info('Generating PDF...', {
                description: 'This may take a few seconds.'
            });

            // Prepare data for the API
            const paperData = {
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
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to generate PDF');
            }
            
            // Check for credit update header
            const remainingCredits = response.headers.get('X-Credits-Remaining');
            if (remainingCredits) {
                // Manually update the user credits in the UI if possible
                // We might need to force a re-fetch of the user session or update local state
                // Since useSupabaseAuth doesn't expose a setter, we can trigger a global event or just reload
                window.location.reload(); 
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
            <div className="flex flex-col items-center pb-20">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={paperQuestions.map(q => q.instanceId || q.id)} 
                        strategy={verticalListSortingStrategy}
                    >
                        {pages.map((pageQuestions, pageIndex) => (
                            <div 
                                key={pageIndex}
                                className={`paper-sheet ${settings.template === 'modern' ? 't-modern' : settings.template === 'minimal' ? 't-minimal' : 't-classic'} ${settings.pageBorder}`}
                                style={{ 
                                    fontFamily,
                                    padding: `${marginPx}px`,
                                    fontSize: `${settings.fontSize}px`,
                                    lineHeight: settings.lineHeight,
                                    position: 'relative'
                                }}
                            >
                                {/* Only Page 1 gets full header */}
                                {pageIndex === 0 && (
                                    <div className="paper-header mb-6">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            {/* LEFT Slot */}
                                            <div className="w-[80px] shrink-0 flex justify-start">
                                                {settings.logo && settings.logoPosition === 'left' && (
                                                    <img src={settings.logo} alt="Logo" className="w-[80px] h-[80px] object-contain" />
                                                )}
                                            </div>

                                            {/* CENTER Slot */}
                                            <div className="flex-1 flex flex-col items-center text-center pt-2">
                                                {settings.logo && settings.logoPosition === 'center' && (
                                                    <img src={settings.logo} alt="Logo" className="w-[80px] h-[80px] object-contain mb-2" />
                                                )}
                                                {settings.institution && (
                                                    <div className="p-institution font-bold uppercase tracking-wide text-slate-800 mb-1 leading-snug">
                                                        {settings.institution}
                                                    </div>
                                                )}
                                                <div className="p-title font-black text-xl uppercase tracking-tight text-slate-900 leading-tight">
                                                    {settings.title}
                                                </div>
                                            </div>

                                            {/* RIGHT Slot */}
                                            <div className="w-[80px] shrink-0 flex justify-end">
                                                {settings.logo && settings.logoPosition === 'right' && (
                                                    <img src={settings.logo} alt="Logo" className="w-[80px] h-[80px] object-contain" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className="p-meta flex justify-between items-center pb-3 border-b-2 border-slate-900"
                                            style={{ marginBottom: `${settings.studentDetailsGap || 12}px` }}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Duration</span>
                                                <span className="font-bold text-slate-900">{settings.duration || '3 Hours'}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Max Marks</span>
                                                <span className="font-bold text-slate-900">{settings.totalMarks || '100'}</span>
                                            </div>
                                        </div>


                                        {/* Student Details Section */}
                                        {(settings.studentName || settings.rollNumber || settings.classSection || settings.dateField || settings.invigilatorSign) && (
                                            <div 
                                                className="grid grid-cols-2 mb-6 pb-4 border-b border-slate-900/10 text-sm" 
                                                style={{
                                                    fontSize: `${settings.metaFontSize}px`,
                                                    columnGap: '40px',
                                                    rowGap: `${settings.studentDetailsGap || 12}px`
                                                }}
                                            >
                                                {settings.studentName && (
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-semibold text-slate-700 whitespace-nowrap mr-2">Name:</span> 
                                                        <span className="flex-1 border-b border-slate-300"></span>
                                                    </div>
                                                )}
                                                {settings.rollNumber && (
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-semibold text-slate-700 whitespace-nowrap mr-2">Roll No:</span> 
                                                        <span className="flex-1 border-b border-slate-300"></span>
                                                    </div>
                                                )}
                                                {settings.classSection && (
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-semibold text-slate-700 whitespace-nowrap mr-2">Class/Sec:</span> 
                                                        <span className="flex-1 border-b border-slate-300"></span>
                                                    </div>
                                                )}
                                                {settings.dateField && (
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-semibold text-slate-700 whitespace-nowrap mr-2">Date:</span> 
                                                        <span className="flex-1 border-b border-slate-300 text-right px-1">{settings.date}</span>
                                                    </div>
                                                )}
                                                {settings.invigilatorSign && (
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-semibold text-slate-700 whitespace-nowrap mr-2">Invigilator:</span> 
                                                        <span className="flex-1 border-b border-slate-300"></span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Instructions */}
                                        {/* Instructions */}
                                        {settings.instructions && settings.instructions.replace(/<[^>]*>/g, '').trim().length > 0 && (
                                            <div className="mb-6" style={{fontSize: `${settings.metaFontSize}px`, textAlign: settings.contentAlignment || 'left'}}>
                                                <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Instructions</div>
                                                <div 
                                                    className="text-sm leading-relaxed instruction-content" 
                                                    style={{textAlign: settings.contentAlignment || 'left'}} 
                                                    dangerouslySetInnerHTML={{__html: settings.instructions}}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Watermark */}
                                {settings.watermark && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04] overflow-hidden select-none">
                                        <div className="transform -rotate-45 text-6xl font-bold whitespace-nowrap text-slate-900 border-4 border-slate-900 p-4 rounded-xl">
                                            {settings.watermark}
                                        </div>
                                    </div>
                                )}

                                <div className={`paper-content relative z-10 ${settings.roughWorkArea === 'right' ? 'flex items-stretch' : ''}`}>
                                    <div className={settings.roughWorkArea === 'right' ? 'w-[75%] pr-6 border-r border-dashed border-slate-200' : 'w-full'}>
                                        <div className={`questions-area ${settings.layout === 'double' ? 'layout-double' : ''}`}>
                                            {pageQuestions.map((q) => {
                                                const currentIndex = globalIndex;
                                                globalIndex++;
                                                return (
                                                    <div key={q.instanceId || q.id} className={`q-wrapper ${settings.separator !== 'none' ? 'q-separator-' + settings.separator : ''}`} style={{breakInside: 'avoid'}}>
                                                        <SortableQuestionItem 
                                                            question={q} 
                                                            index={currentIndex} 
                                                            onRemove={removeFromPaper}
                                                        />
                                                        {settings.answerSpace !== 'none' && (
                                                            <div className={`answer-space-${settings.answerSpace}`}></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {settings.roughWorkArea === 'right' && (
                                        <div className="w-[25%] pl-4">
                                            <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider text-center sticky top-0">Rough Work</div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {settings.pageNumbering !== 'hidden' && (
                                    <div className="absolute bottom-6 left-0 w-full px-12">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium border-t border-slate-200 pt-2">
                                            <div>{settings.footerText}</div>
                                            <div>
                                                {settings.pageNumbering === 'page-x-of-y' && `Page ${pageIndex + 1} of ${pages.length}`}
                                                {settings.pageNumbering === 'x-slash-y' && `${pageIndex + 1} / ${pages.length}`}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        );
    };

    if (authLoading) {
        return (
            <DashboardLayout fullScreen={true}>
                <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                    <AppLoader text="Verifying session..." />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout fullScreen={true}>
            <div className="main-container" ref={containerRef}>
                
                <div className={`editor-panel ${mobileTab === 'editor' ? 'block' : 'hidden'} lg:block`} style={{ width: `${leftPanelWidth}%` }} data-lenis-prevent>
                    <div className="editor-header">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => router.back()} className="p-1 hover:bg-slate-100 rounded-full">
                                    <i className="ri-arrow-left-line text-slate-500" style={{fontSize: '18px'}}></i>
                                </button>
                                <h1>Paper Designer</h1>
                            </div>
                            <div className="breadcrumbs">Home / {settings.chapters.join(', ')} / {settings.title}</div>
                        </div>
                        <div className="header-actions">
                            <button className="btn-action hidden lg:flex" onClick={() => setShowPreviewModal(true)}><i className="ri-eye-line"></i> Preview</button>
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

                        <div className="row">
                            <div className="col" style={{flex: 0.8}}>
                                <label>Duration</label>
                                <input type="text" className="input-box" value={settings.duration} onChange={e => setSettings({...settings, duration: e.target.value})} />
                            </div>
                            <div className="col" style={{flex: 0.8}}>
                                <label>Total Marks</label>
                                <input type="text" className="input-box" value={settings.totalMarks} onChange={e => setSettings({...settings, totalMarks: e.target.value})} />
                            </div>
                            <div className="col">
                                <label>Difficulty Mix</label>
                                <div className="toggle-container">
                                    {['easy', 'mixed', 'hard'].map(d => (
                                        <button 
                                            key={d}
                                            className={`toggle-btn ${settings.difficulty === d ? 'active' : ''}`}
                                            onClick={() => {
                                                setSettings({...settings, difficulty: d as any});
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {d.charAt(0).toUpperCase() + d.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="section-divider"></div>
                        
                        <div className="section-header" onClick={() => setShowBranding(!showBranding)}>
                            <i className={`ri-arrow-down-s-line dropdown-icon ${showBranding ? 'rotated' : ''}`}></i>
                            <div className="section-title"><i className="ri-layout-masonry-line"></i> Formatting & Branding</div>
                        </div>

                        <div className={`collapsible-content ${showBranding ? 'show' : ''}`} id="content-branding">
                            <div className="row">
                                <div className="col" style={{flex: 2}}>
                                    <label>Institution Name</label>
                                    <input type="text" className="input-box" placeholder="e.g. St. Xavier's High School" value={settings.institution} onChange={e => setSettings({...settings, institution: e.target.value})} />
                                </div>
                                <div className="col">
                                    <label>Logo Image</label>
                                    <div className="file-upload-box" onClick={() => document.getElementById('logoInput')?.click()}>
                                        <i className="ri-upload-cloud-2-line file-icon"></i>
                                        <span style={{fontSize: '10px', fontWeight: 600, color: '#64748b'}}>
                                            {settings.logo ? 'Change' : 'Upload'}
                                        </span>
                                        <input type="file" id="logoInput" hidden accept="image/*" onChange={handleLogoUpload} />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>Logo Position</label>
                                    <div className="visual-select">
                                        {['left', 'center', 'right'].map((pos) => (
                                            <div 
                                                key={pos}
                                                className={`visual-option ${settings.logoPosition === pos ? 'active' : ''}`}
                                                onClick={() => setSettings({...settings, logoPosition: pos as any})}
                                            >
                                                <i className={`ri-align-${pos === 'center' ? 'center' : pos}`}></i>
                                                <span className="capitalize">{pos}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col">
                                    <label>Page Layout</label>
                                    <div className="visual-select">
                                        <div className={`visual-option ${settings.layout === 'single' ? 'active' : ''}`} onClick={() => setSettings({...settings, layout: 'single'})}>
                                            <div className="icon-box icon-1-col"></div> <span>Single</span>
                                        </div>
                                        <div className={`visual-option ${settings.layout === 'double' ? 'active' : ''}`} onClick={() => setSettings({...settings, layout: 'double'})}>
                                            <div className="icon-box icon-2-col"></div> <span>2-Col</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>Font Size <span className="range-value">{settings.fontSize}px</span></label>
                                    <div className="range-slider-container">
                                        <input type="range" className="range-slider" min="10" max="18" value={settings.fontSize} onInput={(e) => setSettings({...settings, fontSize: Number(e.currentTarget.value)})} />
                                    </div>
                                </div>
                                <div className="col">
                                    <label>Line Height <span className="range-value">{settings.lineHeight}</span></label>
                                    <div className="range-slider-container">
                                        <input type="range" className="range-slider" min="1.0" max="2.0" step="0.1" value={settings.lineHeight} onInput={(e) => setSettings({...settings, lineHeight: Number(e.currentTarget.value)})} />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>Answer Space</label>
                                    <select className="input-box" value={settings.answerSpace} onChange={e => setSettings({...settings, answerSpace: e.target.value as any})}>
                                        <option value="none">None</option>
                                        <option value="lines">Dotted Lines (2)</option>
                                        <option value="box">Empty Box</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <label>Separator Line</label>
                                    <select className="input-box" value={settings.separator} onChange={e => setSettings({...settings, separator: e.target.value as any})}>
                                        <option value="none">Hidden</option>
                                        <option value="solid">Solid Black</option>
                                        <option value="double">Double Line</option>
                                        <option value="dashed">Dashed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>Page Border</label>
                                    <select className="input-box" value={settings.pageBorder} onChange={e => setSettings({...settings, pageBorder: e.target.value as any})}>
                                        <option value="none">None</option>
                                        <option value="border-simple">Simple Line</option>
                                        <option value="border-double">Double Line</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <label>Font Family</label>
                                    <select className="input-box" value={settings.font} onChange={e => setSettings({...settings, font: e.target.value as any})}>
                                        <option value="jakarta">Jakarta Sans</option>
                                        <option value="merriweather">Merriweather (Serif)</option>
                                        <option value="inter">Inter</option>
                                        <option value="mono">Mono</option>
                                    </select>
                                </div>
                            </div>
                             <div className="row">
                                <div className="col">
                                    <label>Template</label>
                                    <select className="input-box" value={settings.template} onChange={e => setSettings({...settings, template: e.target.value as any})}>
                                        <option value="classic">Classic</option>
                                        <option value="modern">Modern</option>
                                        <option value="minimal">Minimal</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <label>Margin</label>
                                    <div className="toggle-container">
                                        {['S', 'M', 'L'].map(m => (
                                            <button 
                                                key={m}
                                                className={`toggle-btn ${settings.margin === m ? 'active' : ''}`}
                                                onClick={() => setSettings({...settings, margin: m as any})}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                    <label style={{marginTop: '8px'}}>Content Font Size</label>
                                    <div className="range-slider-container">
                                        <input type="range" className="range-slider" min="10" max="16" value={settings.metaFontSize} onInput={(e) => setSettings({...settings, metaFontSize: Number(e.currentTarget.value)})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-divider"></div>
                        <div className="section-header" onClick={() => setShowInstructions(!showInstructions)}>
                            <i className={`ri-arrow-down-s-line dropdown-icon ${showInstructions ? 'rotated' : ''}`}></i>
                            <div className="section-title"><i className="ri-file-list-3-line"></i> Instructions & Content</div>
                        </div>
                        <div className={`collapsible-content ${showInstructions ? 'show' : ''}`}>
                            <div className="col">
                                <label>General Instructions</label>
                                <div className="rich-editor-container">
                                    <div className="editor-toolbar">
                                        <button className="tool-btn" onClick={() => document.execCommand('bold', false, '')}><b>B</b></button>
                                        <button className="tool-btn" onClick={() => document.execCommand('italic', false, '')}><i>I</i></button>
                                        <button className="tool-btn" onClick={() => document.execCommand('insertUnorderedList', false, '')}><i className="ri-list-unordered"></i></button>
                                    </div>
                                    <RichTextEditor 
                                        initialValue={settings.instructions}
                                        onChange={(html) => setSettings(prev => ({...prev, instructions: html}))}
                                    />
                                </div>
                            </div>
                            <div className="row" style={{marginTop: '12px'}}>
                                <div className="col">
                                    <label>Content Alignment</label>
                                    <div className="visual-select">
                                        {['left', 'center', 'justify'].map((align) => (
                                            <div 
                                                key={align}
                                                className={`visual-option ${settings.contentAlignment === align ? 'active' : ''}`}
                                                onClick={() => setSettings({...settings, contentAlignment: align as any})}
                                            >
                                                <i className={`ri-align-${align}`}></i>
                                                <span className="capitalize">{align}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col">
                                    <label>Watermark Text</label>
                                    <input type="text" className="input-box" placeholder="e.g. CONFIDENTIAL" value={settings.watermark || ''} onChange={e => setSettings({...settings, watermark: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="section-divider"></div>
                        <div className="section-header" onClick={() => setShowStudent(!showStudent)}>
                            <i className={`ri-arrow-down-s-line dropdown-icon ${showStudent ? 'rotated' : ''}`}></i>
                            <div className="section-title"><i className="ri-user-smile-line"></i> Student Details</div>
                        </div>
                        <div className={`collapsible-content ${showStudent ? 'show' : ''}`}>
                            <div className="checkbox-grid">
                                <label className="checkbox-label"><input type="checkbox" checked={settings.studentName} onChange={e => setSettings({...settings, studentName: e.target.checked})} /> Student Name</label>
                                <label className="checkbox-label"><input type="checkbox" checked={settings.rollNumber} onChange={e => setSettings({...settings, rollNumber: e.target.checked})} /> Roll Number</label>
                                <label className="checkbox-label"><input type="checkbox" checked={settings.classSection} onChange={e => setSettings({...settings, classSection: e.target.checked})} /> Class/Section</label>
                                <label className="checkbox-label"><input type="checkbox" checked={settings.dateField} onChange={e => setSettings({...settings, dateField: e.target.checked})} /> Date</label>
                                <label className="checkbox-label"><input type="checkbox" checked={settings.invigilatorSign} onChange={e => setSettings({...settings, invigilatorSign: e.target.checked})} /> Invigilator Sign</label>
                            </div>
                            
                            <div className="row" style={{marginTop: '16px'}}>
                                <div className="col">
                                    <label>Row Spacing <span className="range-value">{settings.studentDetailsGap || 12}px</span></label>
                                    <div className="range-slider-container">
                                        <input 
                                            type="range" 
                                            className="range-slider" 
                                            min="8" 
                                            max="40" 
                                            step="4"
                                            value={settings.studentDetailsGap || 12} 
                                            onInput={(e) => setSettings({...settings, studentDetailsGap: Number(e.currentTarget.value)})} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-divider"></div>
                        <div className="section-header" onClick={() => setShowFooter(!showFooter)}>
                            <i className={`ri-arrow-down-s-line dropdown-icon ${showFooter ? 'rotated' : ''}`}></i>
                            <div className="section-title"><i className="ri-layout-bottom-2-line"></i> Footer & Layout</div>
                        </div>
                        <div className={`collapsible-content ${showFooter ? 'show' : ''}`}>
                            <div className="row">
                                <div className="col">
                                    <label>Footer Text</label>
                                    <input type="text" className="input-box" placeholder="e.g. Please Turn Over" value={settings.footerText} onChange={e => setSettings({...settings, footerText: e.target.value})} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label>Rough Work Area</label>
                                    <div className="toggle-container">
                                        <button className={`toggle-btn ${settings.roughWorkArea === 'none' ? 'active' : ''}`} onClick={() => setSettings({...settings, roughWorkArea: 'none'})}>None</button>
                                        <button className={`toggle-btn ${settings.roughWorkArea === 'right' ? 'active' : ''}`} onClick={() => setSettings({...settings, roughWorkArea: 'right'})}>Right Col</button>
                                    </div>
                                </div>
                                <div className="col">
                                    <label>Page Numbering</label>
                                    <select className="input-box" value={settings.pageNumbering} onChange={e => setSettings({...settings, pageNumbering: e.target.value as any})}>
                                        <option value="page-x-of-y">Page 1 of 5</option>
                                        <option value="x-slash-y">1 / 5</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tab-group">
                        <div className={`tab ${activeTab === 'select' ? 'active' : ''}`} onClick={() => setActiveTab('select')}>Select Questions</div>
                        <div className={`tab ${activeTab === 'auto' ? 'active' : ''}`} onClick={() => setActiveTab('auto')}>Auto-Generate</div>
                    </div>

                    {activeTab === 'select' ? (
                        <>
                            <div className="search-bar">
                                <i className="ri-search-line"></i>
                                <input 
                                    type="text" 
                                    className="search-input" 
                                    placeholder="Search topics (e.g. Thermodynamics)" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {settings.chapters.length > 0 && (
                                <div className="mt-2 flex gap-2 flex-wrap">
                                     {settings.chapters.map(chap => {
                                         const isPrioritized = priorityChapter === chap;
                                         return (
                                            <div 
                                                key={chap} 
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
                                                    isPrioritized 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                        : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                                                }`}
                                                onClick={() => {
                                                    setPriorityChapter(prev => prev === chap ? null : chap);
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <i className="ri-book-open-line"></i> {chap}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSettings(s => ({...s, chapters: s.chapters.filter(c => c !== chap)}));
                                                        if (priorityChapter === chap) setPriorityChapter(null);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`ml-1 focus:outline-none ${isPrioritized ? 'hover:text-indigo-200' : 'hover:text-indigo-900'}`}
                                                >
                                                    <i className="ri-close-line"></i>
                                                </button>
                                            </div>
                                         );
                                     })}
                                </div>
                            )}
        
                            <div id="source-list">
                        {isLoadingQuestions && (
                            <div className="py-12">
                                <AppLoader text="Loading Question Bank..." />
                            </div>
                        )}

                        {!isLoadingQuestions && filteredQuestions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                                        <i className="ri-inbox-2-line text-4xl mb-2 opacity-50"></i>
                                        {settings.difficulty === 'easy' ? (
                                            <div className="max-w-[200px]">
                                                <div className="font-medium text-slate-600 mb-1">No easy questions found</div>
                                                <div className="text-xs">Please try selecting <strong>Medium</strong> or <strong>Hard</strong> from the Difficulty Mix.</div>
                                            </div>
                                        ) : (
                                            <div>No questions found matching your criteria.</div>
                                        )}
                                    </div>
                                )}
        
                                {!isLoadingQuestions && filteredQuestions.length > 0 && (
                                    <>
                                        {filteredQuestions.map(q => {
                                            const isAdded = paperQuestions.some(pq => pq.id === q.id);
                                            // Badge Colors
                                            const getTypeStyle = (t: string) => {
                                                if (t === 'mcq') return { bg: '#EFF6FF', col: '#2563EB' }; // Blue
                                                return { bg: '#F3F4F6', col: '#4B5563' }; // Gray
                                            };
                                            const getDiffStyle = (d: string) => {
                                                if (d === 'easy') return { bg: '#DCFCE7', col: '#16A34A' }; // Green
                                                if (d === 'medium') return { bg: '#FEF9C3', col: '#CA8A04' }; // Yellow
                                                if (d === 'hard') return { bg: '#FEE2E2', col: '#DC2626' }; // Red
                                                return { bg: '#F3F4F6', col: '#4B5563' };
                                            };
        
                                            const tStyle = getTypeStyle(q.type?.toLowerCase() || '');
                                            const dStyle = getDiffStyle(q.difficulty?.toLowerCase() || '');
        
                                            return (
                                                <div 
                                                    key={q.id} 
                                                    className={`q-card ${isAdded ? 'added' : ''}`} 
                                                    onClick={() => !isAdded && addToPaper(q)}
                                                >
                                                    <div className="badges">
                                                        <div 
                                                            className="badge" 
                                                            style={{background: tStyle.bg, color: tStyle.col}}
                                                        >
                                                            {q.type?.toUpperCase() || 'Q'}
                                                        </div>
                                                        <div 
                                                            className="badge" 
                                                            style={{background: dStyle.bg, color: dStyle.col}}
                                                        >
                                                            {q.difficulty?.toUpperCase()}
                                                        </div>
                                                        {q.chapter && <div className="badge" style={{background: '#EEF2FF', color: '#6366F1'}}>{q.chapter}</div>}
                                                    </div>
                                                    {isAdded && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 font-bold text-slate-900/60 text-sm uppercase tracking-wider backdrop-blur-[1px]">
                                                            Selected
                                                        </div>
                                                    )}
                                                    <div className="q-text mb-2">{q.text}</div>
                                                    {q.options && q.options.length > 0 && (
                                                        <div className="text-xs text-slate-500 flex flex-col gap-1 pl-1 border-l-2 border-slate-200">
                                                            {q.options.map((opt, idx) => (
                                                                <div key={opt.id}>
                                                                    <span className="font-semibold text-slate-400 mr-1">{String.fromCharCode(65 + idx)})</span>
                                                                    {opt.text}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-slate-500">
                                            <button 
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                                disabled={currentPage === 1}
                                                className="px-3 py-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <i className="ri-arrow-left-line mr-1"></i> Previous
                                            </button>
                                            <span>Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE) || 1}</span>
                                            <button 
                                                onClick={() => setCurrentPage(p => p + 1)} 
                                                disabled={!hasMore && (currentPage * PAGE_SIZE >= totalCount)}
                                                className="px-3 py-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next <i className="ri-arrow-right-line ml-1"></i>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        // AI Chat Interface
                        <div className="flex flex-col h-full bg-slate-50">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatMessages.map((msg, i) => {
                                    // Skip rendering the placeholder "Thinking..." message as we have a dedicated loader below
                                    if (msg.role === 'assistant' && msg.content === 'QuestionHive is thinking...') return null;
                                    
                                    return (
                                    <div key={i} className="flex flex-col space-y-2">
                                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                            
                                        {/* Render Generated Questions Outside Bubble */}
                                        {msg.questions && (
                                            <div className="w-full space-y-3 px-1">
                                                {msg.questions.map((q, qIdx) => {
                                                    const isAdded = paperQuestions.some(pq => pq.id === q.id);
                                                    return (
                                                        <div 
                                                            key={q.id || `q-${i}-${qIdx}`}
                                                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                                                                isAdded 
                                                                    ? 'bg-indigo-50 border-indigo-200' 
                                                                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                                                            }`}
                                                            onClick={() => !isAdded && addToPaper(q)}
                                                        >
                                                            {isAdded && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20 font-bold text-slate-900/60 text-sm uppercase tracking-wider backdrop-blur-[1px]">
                                                                    Selected
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex gap-2">
                                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{q.type}</span>
                                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{q.difficulty}</span>
                                                                </div>
                                                                {isAdded && <i className="ri-check-line text-indigo-600 font-bold"></i>}
                                                            </div>
                                                            <div className="text-sm font-medium text-slate-900 mb-3 whitespace-pre-wrap leading-relaxed">{q.text}</div>
                                                            
                                                            {/* Render Options */}
                                                            {q.options && q.options.length > 0 && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {q.options.map((opt, idx) => (
                                                                        <div key={opt.id || idx} className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1.5 border border-slate-100">
                                                                            <span className="font-bold text-slate-500 mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                                                                            {opt.text}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                                {isStreaming && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                                            <div className="relative flex items-center justify-center">
                                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                                                <Loader2 size={18} className="animate-spin text-indigo-600 relative z-10" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {object?.questions && object.questions.length > 0 
                                                        ? `Generating Question ${object.questions.length + 1}...` 
                                                        : "QuestionHive is thinking..."}
                                                </span>
                                                {object?.questions && object.questions.length > 0 && (
                                                    <span className="text-xs text-slate-400">Streamed {object.questions.length} items so far</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            
                            {/* Chat Input */}
                            <div className="p-4 bg-white border-t border-slate-200">
                                {/* Suggested Prompts */}
                                {!isStreaming && chatMessages.length < 3 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                                        {suggestedPrompts.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(prompt)}
                                                className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <form 
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type a command e.g., 'Create 5 hard physics questions'"
                                        className="flex-1 input-box m-0"
                                        disabled={isStreaming}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isStreaming || !chatInput.trim()}
                                        className="bg-indigo-600 text-white rounded-lg px-4 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="ri-send-plane-fill"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>

                <div className="resizer hidden lg:block" onMouseDown={handleResizeMouseDown}></div>

                <div 
                    className={`preview-panel ${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex`} 
                    data-lenis-prevent 
                    style={{ 
                        overflow: 'hidden', 
                        flexDirection: 'column' 
                    }}
                >

                    <div className={`flex-1 bg-slate-50/50 p-4 lg:p-8 flex ${zoomLevel <= 100 ? 'overflow-auto justify-start' : 'overflow-auto justify-center'}`}>
                        <div 
                            style={{ 
                                transform: `scale(${zoomLevel / 100})`, 
                                transformOrigin: 'top center',
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
                            <PaperContent />
                        </div>
                    </div>
                </div>

            </div>

             {/* Mobile View Toggle (Fixed Bottom) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white backdrop-blur-md px-1 p-1 rounded-full shadow-2xl z-50 flex items-center gap-1 border border-slate-700/50">
                <button 
                    onClick={() => setMobileTab('editor')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutTemplate size={16} />
                    Editor
                </button>
                <button 
                    onClick={() => setMobileTab('preview')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Eye size={16} />
                    Preview
                </button>
            </div>
        </DashboardLayout>
    );
}
