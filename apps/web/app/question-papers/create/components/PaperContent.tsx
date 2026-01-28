import React from 'react';
import { 
    DndContext, 
    closestCenter,
    DragEndEvent,
    SensorDescriptor,
    SensorOptions
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableQuestionItem } from './SortableQuestionItem';
import { Question, PaperSettings } from '../types';

interface PaperContentProps {
    settings: PaperSettings;
    paperQuestions: Question[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onRemoveQuestion: (idOrInstanceId: string) => void;
}

export const PaperContent: React.FC<PaperContentProps> = ({
    settings,
    paperQuestions,
    sensors,
    onDragEnd,
    onRemoveQuestion
}) => {
    // --- Helper Functions ---
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
                onDragEnd={onDragEnd}
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
                                                <div 
                                                    className="p-institution font-bold uppercase tracking-wide text-slate-800 mb-1 leading-snug"
                                                    style={{ fontSize: `${settings.fontSize * 0.8}px` }}
                                                >
                                                    {settings.institution}
                                                </div>
                                            )}
                                            <div 
                                                className="p-title font-black uppercase tracking-tight text-slate-900 leading-tight"
                                                style={{ fontSize: `${settings.fontSize * 1.5}px` }}
                                            >
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
                                            <span className="uppercase font-bold text-slate-500 tracking-wider" style={{ fontSize: `${settings.fontSize * 0.7}px` }}>Duration</span>
                                            <span className="font-bold text-slate-900" style={{ fontSize: `${settings.fontSize}px` }}>{settings.duration || '0 Min'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="uppercase font-bold text-slate-500 tracking-wider" style={{ fontSize: `${settings.fontSize * 0.7}px` }}>Max Marks</span>
                                            <span className="font-bold text-slate-900" style={{ fontSize: `${settings.fontSize}px` }}>{settings.totalMarks || '0'}</span>
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
                                    <div className="transform -rotate-45 text-5xl font-bold whitespace-nowrap text-slate-900 border-4 border-slate-900 p-4 rounded-xl">
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
                                                        onRemove={onRemoveQuestion}
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
