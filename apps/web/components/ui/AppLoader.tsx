import { GraduationCap } from "lucide-react";

interface AppLoaderProps {
    text?: string;
}

export default function AppLoader({ text = "Loading..." }: AppLoaderProps) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="relative">
                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-blue-500 rounded-xl animate-ping opacity-20"></div>
                
                {/* Logo Container */}
                <img src="/logo-new.png" alt="Loading..." className="relative w-16 h-16 rounded-xl shadow-lg shadow-blue-500/20 object-contain" />
            </div>
            
            {/* Loading Grid/Dots Animation (Optional but adds flair) */}
            <div className="mt-8 flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    ></div>
                ))}
            </div>

            <p className="mt-4 text-slate-500 font-medium text-sm tracking-wide animate-pulse">
                {text}
            </p>
        </div>
    );
}
