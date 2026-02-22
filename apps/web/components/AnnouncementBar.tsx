"use client";

import { Sparkles, Monitor } from "lucide-react";

export const AnnouncementBar = () => {
  return (
    <div className="bg-slate-900 text-white text-xs md:text-sm font-medium py-2.5 px-4 text-center relative z-[60] flex flex-wrap items-center justify-center gap-2">
      <Sparkles size={14} className="text-yellow-400 animate-pulse hidden sm:block" />
      <p className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 mr-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 font-semibold tracking-wide">Beta Release Now Live</span>
        </span>
        <span className="hidden sm:inline mx-1 text-slate-500">·</span>
        <span className="text-blue-200 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Controlled Access</span>
        <span className="hidden sm:inline mx-1 text-slate-500">·</span>
        <span className="text-slate-400 flex items-center gap-1.5 ml-1">
            <Monitor size={12} />
            <span className="hidden sm:inline">Desktop Optimized</span>
            <span className="sm:hidden">Desktop Opt.</span>
        </span>
      </p>
    </div>
  );
};
