import React from 'react';
import { PaperContent } from './PaperContent';
import { PaperSettings, Question } from '../types';
import { SensorDescriptor, SensorOptions, DragEndEvent } from '@dnd-kit/core';

interface PreviewPanelProps {
    mobileTab: 'editor' | 'preview';
    zoomLevel: number;
    settings: PaperSettings;
    paperQuestions: Question[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onRemoveQuestion: (id: string) => void;
    handleExportClick: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    mobileTab,
    zoomLevel,
    settings,
    paperQuestions,
    sensors,
    onDragEnd,
    onRemoveQuestion,
    handleExportClick
}) => {
    return (
        <div 
            className={`preview-panel ${mobileTab === 'preview' ? 'flex' : 'hidden'}`} 
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
                    <PaperContent 
                        settings={settings}
                        paperQuestions={paperQuestions}
                        sensors={sensors}
                        onDragEnd={onDragEnd}
                        onRemoveQuestion={onRemoveQuestion}
                    />
                </div>
            </div>
            
            <button className="fab-export" onClick={handleExportClick}><i className="ri-file-pdf-line"></i> Export PDF</button>
        </div>
    );
};
