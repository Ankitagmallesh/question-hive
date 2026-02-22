import React from 'react';
import { Loader2 } from 'lucide-react';
import { Question, ChatMessage } from '../types';

interface AIChatInterfaceProps {
    chatMessages: ChatMessage[];
    isStreaming: boolean;
    object: any; // The streaming object from useObject
    paperQuestions: Question[];
    addToPaper: (q: Question) => void;
    chatInput: string;
    setChatInput: (value: string) => void;
    handleSendMessage: (text?: string) => void;
    chatEndRef: React.RefObject<HTMLDivElement>;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
    chatMessages,
    isStreaming,
    object,
    paperQuestions,
    addToPaper,
    chatInput,
    setChatInput,
    handleSendMessage,
    chatEndRef
}) => {
    const suggestedPrompts = [
        "Create 3 hard multiple choice questions on Calculus",
        "Generate 5 easy Physics questions about motion",
        "Create questions about Indian History",
        "Generate Chemistry questions for Grade 10"
    ];

    return (
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
    );
};
