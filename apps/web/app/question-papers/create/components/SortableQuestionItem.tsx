import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '../types';

interface SortableQuestionItemProps {
    question: Question;
    index: number;
    onRemove: (id: string) => void;
}

export const SortableQuestionItem = ({ question, index, onRemove }: SortableQuestionItemProps) => {
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
