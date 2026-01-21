"use client";

import { useEffect, useState } from "react";
import { FlaskConical, BrainCircuit, Scale, PenTool, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    onComplete: () => void;
}

export default function LoadingOverlay({ onComplete }: LoadingOverlayProps) {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        // Step 0 is active immediately
        const t1 = setTimeout(() => setActiveStep(1), 1000); // Analyze done, start Balance
        const t2 = setTimeout(() => setActiveStep(2), 2500); // Balance done, start Format
        const t3 = setTimeout(() => {
            setActiveStep(3); // All done
            setTimeout(onComplete, 500); // Short delay before navigation
        }, 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    const steps = [
        { icon: BrainCircuit, text: "Analyzing syllabus constraints..." },
        { icon: Scale, text: "Balancing difficulty (30% Hard)..." },
        { icon: PenTool, text: "Formatting mathematical equations..." }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-2xl animate-ping opacity-20"></div>
                        <FlaskConical className="w-8 h-8 text-indigo-600 relative z-10" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-900">Generating Assessment</h2>
                    <p className="text-slate-500 mt-2 font-medium">Physics • NEET • Laws of Motion</p>
                </div>

                <div className="space-y-4 pl-10 border-l-2 border-slate-100">
                    {steps.map((step, idx) => {
                        let status = 'pending';
                        if (activeStep === idx) status = 'active';
                        if (activeStep > idx) status = 'done';

                        return (
                            <div 
                                key={idx}
                                className={`flex items-center gap-3 transition-all duration-300 ${
                                    status === 'active' ? 'opacity-100 font-semibold text-indigo-600 scale-105 origin-left' : 
                                    status === 'done' ? 'opacity-50 text-emerald-600' : 'opacity-30'
                                }`}
                            >
                                {status === 'done' ? (
                                    <CheckCircle2 className="w-4 h-4" /> 
                                ) : (
                                    <step.icon className="w-4 h-4" />
                                )}
                                {step.text}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
