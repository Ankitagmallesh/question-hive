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
import { useToast } from '../../../components/ui/use-toast';
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
    
    // Branding
    institution: string;
    font: 'jakarta' | 'merriweather';
    template: 'classic' | 'modern' | 'minimal';
    margin: 'S' | 'M' | 'L';
    fontSize: number;
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
                <span className="font-bold text-slate-900 w-6 shrink-0">{index + 1}.</span>
                <div className="flex-1 pr-16">
                    <div 
                        className="font-semibold text-slate-900 text-sm mb-1 leading-relaxed"
                        style={{ color: '#000000', minHeight: '1.2em' }}
                    >
                        {question.text || 'Question Text Missing'}
                        {question.marks ? <span className="float-right text-xs font-normal text-slate-500">[{question.marks} marks]</span> : null}
                    </div>
                    {question.options && question.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                             {question.options.map((opt, idx) => (
                                <div key={opt.id} className="text-xs text-slate-600">
                                    <span className="font-medium mr-1">({String.fromCharCode(65 + idx)})</span> 
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

export default function PaperDesignerPage() {
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
        font: 'jakarta',
        template: 'classic',
        margin: 'M',
        fontSize: 14
    });

    const [showBranding, setShowBranding] = useState(false);
    const [activeTab, setActiveTab] = useState<'select' | 'auto'>('select');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [priorityChapter, setPriorityChapter] = useState<string | null>(null);

    const [paperQuestions, setPaperQuestions] = useState<Question[]>([]);
    const [sourceQuestions, setSourceQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const searchParams = useSearchParams();

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
                } else if (data.length > 0) {
                     // Default fallback if nothing in URL
                     if (data[0]?.name) {
                        setSettings(s => ({...s, chapters: [data[0].name]}));
                     }
                }
            }
        };
        fetchChapters();
        fetchChapters();
    }, [searchParams]);

    // --- Draft Persistence ---
    // 1. Auto-save to LocalStorage
    useEffect(() => {
        if (settings.chapters.length > 0 || paperQuestions.length > 0) {
            const draft = {
                settings,
                paperQuestions,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('current_paper_draft', JSON.stringify(draft));
        }
    }, [settings, paperQuestions]);

    // 2. Load from LocalStorage if resume=true OR savedId is present
    useEffect(() => {
        const resume = searchParams.get('resume') === 'true';
        const savedId = searchParams.get('savedId');

        if (resume) {
            const saved = localStorage.getItem('current_paper_draft');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.settings) setSettings(parsed.settings);
                    if (parsed.paperQuestions) setPaperQuestions(parsed.paperQuestions);
                } catch (e) { console.error(e); }
            }
        } else if (savedId) {
            const allSaved = localStorage.getItem('saved_papers');
            if (allSaved) {
                try {
                    const papers = JSON.parse(allSaved);
                    const found = papers.find((p: any) => p.id === savedId);
                    if (found) {
                        setSettings(found.settings);
                        setPaperQuestions(found.paperQuestions);
                    }
                } catch (e) { console.error(e); }
            }
        }
    }, [searchParams]);

    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSavePaper = async () => {
        if (!settings.title) {
            toast({
                title: "Validation Error",
                description: "Please enter a paper title",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        
        try {
            const savedId = searchParams.get('savedId');
            
            // Construct Payload
            const payload = {
                id: savedId, // If present, API treats as update if numeric, or new if UUID/missing
                settings,
                paperQuestions,
                status: 'Saved'
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

            // Sync with LocalStorage for offline backup (optional but good UX)
            // We update the 'saved_papers' list with the backend ID if possible
            const existingPapers = JSON.parse(localStorage.getItem('saved_papers') || '[]');
            const newPaper = {
                id: result.paperId ? String(result.paperId) : (savedId || crypto.randomUUID()),
                settings,
                paperQuestions,
                savedAt: new Date().toISOString()
            };

            if (savedId) {
                const index = existingPapers.findIndex((p: any) => p.id === savedId);
                if (index !== -1) existingPapers[index] = newPaper;
                else existingPapers.push(newPaper);
            } else {
                existingPapers.push(newPaper);
            }
            localStorage.setItem('saved_papers', JSON.stringify(existingPapers));
            
            // Update URL with new ID if created
            if (result.paperId && (!savedId || savedId !== String(result.paperId))) {
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.set('savedId', String(result.paperId));
                router.replace(`?${newParams.toString()}`);
            }

            toast({
                title: "Success",
                description: "Paper saved to database successfully!",
                duration: 3000,
            });

        } catch (error: any) {
            console.error('Save failed:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to save paper to database.",
                variant: "destructive",
            });
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
            setPaperQuestions([...paperQuestions, q]);
            
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

    const paginateQuestions = (questions: Question[]) => {
        if (questions.length === 0) return [];

        const pages: Question[][] = [];
        let currentPage: Question[] = [];
        
        const PAGE_HEIGHT = 842; // A4 px at 96dpi approx
        const MARGIN = getMargins();
        const CONTENT_WIDTH = 595 - (2 * MARGIN);
        const HEADER_HEIGHT = 160; // Title, meta, inst
        const FOOTER_HEIGHT = 50;
        
        let availableHeight = PAGE_HEIGHT - (2 * MARGIN) - HEADER_HEIGHT - FOOTER_HEIGHT;
        let currentHeight = 0;

        questions.forEach((q) => {
            // Estimate Height
            // Base padding + number (20px) + spacing
            const charWidth = settings.fontSize * 0.6;
            const charsPerLine = Math.floor((CONTENT_WIDTH - 40) / charWidth); // -40 for numbering indent
            const textLines = Math.ceil(q.text.length / charsPerLine);
            const textHeight = textLines * (settings.fontSize * 1.5);
            
            let optionsHeight = 0;
            if (q.options && q.options.length > 0) {
                const optsLines = Math.ceil(q.options.length / 2); // 2 col grid
                optionsHeight = optsLines * 24; // approx 24px per row
            }

            const itemHeight = textHeight + optionsHeight + 30; // 30 buffer/padding/margins

            if (currentHeight + itemHeight > availableHeight) {
                // Push current page and start new
                pages.push(currentPage);
                currentPage = [];
                currentHeight = 0;
                // Next pages don't have the big header
                availableHeight = PAGE_HEIGHT - (2 * MARGIN) - 40 - FOOTER_HEIGHT; // 40 small margin top
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
            <div className="flex flex-col gap-8 items-center pb-20">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={paperQuestions.map(q => q.id)} 
                        strategy={verticalListSortingStrategy}
                    >
                        {pages.map((pageQuestions, pageIndex) => (
                            <div 
                                key={pageIndex}
                                className={`paper-sheet ${settings.template === 'modern' ? 't-modern' : settings.template === 'minimal' ? 't-minimal' : 't-classic'}`}
                                style={{ 
                                    fontFamily,
                                    padding: `${marginPx}px`,
                                    fontSize: `${settings.fontSize}px`,
                                    position: 'relative'
                                }}
                            >
                                {/* Only Page 1 gets full header */}
                                {pageIndex === 0 && (
                                    <div className="paper-header">
                                        <div className="p-institution" style={{display: settings.institution ? 'block' : 'none'}}>{settings.institution}</div>
                                        <div className="p-title">{settings.title}</div>
                                        <div className="p-meta">
                                            <span>Duration: {settings.duration}</span>
                                            <span>Max Marks: {settings.totalMarks}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="paper-content">
                                    {pageQuestions.map((q) => {
                                        const currentIndex = globalIndex;
                                        globalIndex++;
                                        return (
                                            <SortableQuestionItem 
                                                key={q.id} 
                                                question={q} 
                                                index={currentIndex} 
                                                onRemove={removeFromPaper}
                                            />
                                        );
                                    })}
                                </div>

                                <div className="absolute bottom-6 left-0 w-full text-center text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2 px-12">
                                    Page {pageIndex + 1} of {pages.length}
                                </div>
                            </div>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        );
    };

    return (
        <DashboardLayout fullScreen={true}>
            <div className="main-container" ref={containerRef}>
                
                <div className="editor-panel" style={{ width: `${leftPanelWidth}%` }} data-lenis-prevent>
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
                            <button className="btn-action" onClick={() => setShowPreviewModal(true)}><i className="ri-eye-line"></i> Preview</button>
                            <button className="btn-action" onClick={handleSavePaper}><i className="ri-save-line"></i> Save</button>
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

                        <div className={`collapsible-content ${showBranding ? 'show' : ''}`}>
                            <div className="row">
                                <div className="col" style={{flex: 2}}>
                                    <label>Institution Name</label>
                                    <input type="text" className="input-box" placeholder="e.g. St. Xavier's High School" value={settings.institution} onChange={e => setSettings({...settings, institution: e.target.value})} />
                                </div>
                                <div className="col">
                                    <label>Font</label>
                                    <select className="input-box" value={settings.font} onChange={e => setSettings({...settings, font: e.target.value as any})}>
                                        <option value="jakarta">Jakarta (Sans)</option>
                                        <option value="merriweather">Merriweather (Serif)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>Template Layout</label>
                                    <div className="template-grid">
                                        {['classic', 'modern', 'minimal'].map(t => (
                                            <div 
                                                key={t} 
                                                className={`template-option t-${t} ${settings.template === t ? 'active' : ''}`}
                                                onClick={() => setSettings({...settings, template: t as any})}
                                            >
                                                <div className="template-icon"></div> {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col">
                                    <label>Margin Size</label>
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
                                    <label style={{marginTop: '8px'}}>Font Size</label>
                                    <input 
                                        type="range" min="12" max="18" 
                                        value={settings.fontSize} 
                                        style={{width: '100%', accentColor: 'var(--primary)'}}
                                        onChange={e => setSettings({...settings, fontSize: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tab-group">
                        <div className={`tab ${activeTab === 'select' ? 'active' : ''}`} onClick={() => setActiveTab('select')}>Select Questions</div>
                        <div className={`tab ${activeTab === 'auto' ? 'active' : ''}`} onClick={() => setActiveTab('auto')}>Auto-Generate</div>
                    </div>

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
                        {isLoadingQuestions ? (
                            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>
                                <i className="ri-loader-4-line animate-spin mb-2" style={{fontSize: '24px'}}></i>
                                <div className="text-xs font-semibold">Loading Question Bank...</div>
                            </div>
                        ) : (
                            <>
                                {filteredQuestions.length === 0 ? (
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
                                ) : (
                                    filteredQuestions.map(q => {
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
                                    })
                                )}
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

                </div>

                <div className="resizer" onMouseDown={handleResizeMouseDown}></div>

                <div className="preview-panel" data-lenis-prevent>
                    <PaperContent />
                    
                    <button className="fab-export"><i className="ri-file-pdf-line"></i> Export PDF</button>
                </div>

                <div className={`modal-overlay ${showPreviewModal ? 'active' : ''}`}>
                    <div className="close-modal" onClick={() => setShowPreviewModal(false)}><i className="ri-close-circle-line"></i></div>
                    <div className="modal-content">
                        <div style={{ pointerEvents: 'none', transform: 'scale(1)', transformOrigin: 'top center' }}>
                            <PaperContent />
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
