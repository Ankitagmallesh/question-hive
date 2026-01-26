import React, { useState, useRef, useEffect } from 'react';

interface ChapterOption {
    id: string;
    name: string;
}

interface ChapterSelectProps {
    options: ChapterOption[];
    selectedChapters: string[];
    onChange: (val: string) => void;
}

export const ChapterSelect = ({ options, selectedChapters, onChange }: ChapterSelectProps) => {
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
