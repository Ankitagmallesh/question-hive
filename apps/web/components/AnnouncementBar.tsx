"use client";

import { Sparkles } from "lucide-react";

export const AnnouncementBar = () => {
  return (
    <div className="bg-slate-900 text-white text-xs md:text-sm font-medium py-2.5 px-4 text-center relative z-[60] flex items-center justify-center gap-2">
      <Sparkles size={14} className="text-yellow-400 animate-pulse hidden sm:block" />
      <p>
        <span className="opacity-90">Upcoming Beta version launch on Feb 1, 2026</span>
        <span className="mx-2 text-slate-500">|</span>
        <span className="text-blue-200 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Limited access</span>
      </p>
    </div>
  );
};
