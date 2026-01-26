import React from 'react';
import AppLoader from '../../../../components/ui/AppLoader';
import { Question, PaperSettings } from '../types';

interface QuestionListProps {
    settings: PaperSettings;
    setSettings: React.Dispatch<React.SetStateAction<PaperSettings>>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    priorityChapter: string | null;
    setPriorityChapter: React.Dispatch<React.SetStateAction<string | null>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    isLoadingQuestions: boolean;
    filteredQuestions: Question[];
    paperQuestions: Question[];
    addToPaper: (q: Question) => void;
    currentPage: number;
    totalCount: number;
    hasMore: boolean;
    PAGE_SIZE: number;
}

export const QuestionList: React.FC<QuestionListProps> = ({
    settings,
    setSettings,
    searchQuery,
    setSearchQuery,
    priorityChapter,
    setPriorityChapter,
    setCurrentPage,
    isLoadingQuestions,
    filteredQuestions,
    paperQuestions,
    addToPaper,
    currentPage,
    totalCount,
    hasMore,
    PAGE_SIZE
}) => {
    return (
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
    );
};
