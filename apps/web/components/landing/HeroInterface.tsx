'use client';
import React, { useState } from 'react';
import { 
  FileText, Layout, Type, Settings, MoreHorizontal, 
  ChevronDown, RotateCcw, Download, Search, Palette, 
  ListOrdered, User, Save, Clock, Hash
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../../ui/badge'; // Corrected import path

export const HeroInterface: React.FC = () => {
  // State for interactivity
  const [paperTitle, setPaperTitle] = useState('Physics Mock Test - 1');
  const [duration, setDuration] = useState('3 hr');
  const [totalMarks, setTotalMarks] = useState('40');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Mixed' | 'Hard'>('Mixed');
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Top Bar - SaaS App Header - Replaces the simple traffic lights in page.tsx */}
      <div className="h-10 md:h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-3 md:px-4 shrink-0">
        <div className="flex gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 px-2 md:px-4 flex justify-center">
            <div className="bg-white border border-slate-200 rounded-md px-2 md:px-3 py-1 text-[10px] md:text-xs text-slate-500 font-mono flex items-center gap-1 md:gap-2 w-full max-w-[200px] md:max-w-md justify-center">
                <span className="opacity-50 hidden sm:inline">🔒</span>
                <span className="truncate">questionhive.app</span>
            </div>
        </div>
        <div className="w-8 md:w-16"></div>
      </div>

      <div className="h-12 md:h-14 border-b border-slate-200 bg-white flex items-center justify-between px-3 md:px-4 shrink-0">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer transition-colors min-w-0">
            {/* Logo placeholder if needed, or just text */}
            <img src="/logo-new.png" alt="Question Hive" className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 rounded-lg" />
            <div className="flex flex-col min-w-0">
                <span className="text-xs md:text-sm font-semibold text-slate-900 font-serif truncate">Paper Designer</span>
                <span className="text-[9px] md:text-[10px] text-slate-400 font-sans truncate hidden sm:block">Home / Physics / {paperTitle}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Preview
            </button>
            <div className="hidden md:block h-4 w-px bg-slate-200 mx-1"></div>
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                <span className="cursor-pointer hover:text-slate-800">-</span>
                <span className="px-1 text-slate-800">140%</span>
                <span className="cursor-pointer hover:text-slate-800">+</span>
            </div>
            <button className="hidden md:block text-xs font-medium text-slate-400 hover:text-slate-600 px-2">RESET</button>
            <div className="hidden md:block h-4 w-px bg-slate-200 mx-1"></div>
             <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm">
                <Save size={12} className="md:w-[14px] md:h-[14px]" />
                <span className="hidden sm:inline">Save</span>
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[800px] md:h-[500px] lg:h-[600px] bg-slate-50/50 overflow-hidden">
        {/* LEFT PANEL - CONTROLS */}
        <div className="w-full md:w-[320px] lg:w-[420px] flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col h-1/2 md:h-full overflow-hidden">
          
          <div className="w-full h-full overflow-y-auto p-2 md:p-6 space-y-2 md:space-y-6 custom-scrollbar">
              {/* Reference Header */}
              <div className="space-y-2 md:space-y-4">
                 <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paper Title</label>
                       <input 
                         type="text" 
                         value={paperTitle} 
                         onChange={(e) => setPaperTitle(e.target.value)}
                         className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-md text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400"
                       />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chapter</label>
                        <div className="relative">
                            <select className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-md text-xs md:text-sm text-slate-600 appearance-none focus:outline-none focus:border-blue-400 cursor-pointer">
                                <option>Select Chapter</option>
                                <option>Ray Optics & Optical Instruments</option>
                                <option>Wave Optics</option>
                            </select>
                            <ChevronDown className="absolute right-2 md:right-3 top-2 md:top-2.5 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-2 md:gap-3">
                     <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</label>
                        <input 
                            type="text" 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-md text-xs md:text-sm text-center text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Marks</label>
                        <input 
                            type="text" 
                            value={totalMarks}
                            onChange={(e) => setTotalMarks(e.target.value)}
                            className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-md text-xs md:text-sm text-center text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Difficulty Mix</label>
                         <div className="flex bg-slate-100 rounded-md p-0.5">
                            {['Easy', 'Mixed', 'Hard'].map((diff) => (
                                <button 
                                key={diff}
                                onClick={() => setDifficulty(diff as any)}
                                className={`flex-1 py-1 md:py-1.5 text-[9px] md:text-[10px] font-medium rounded-sm transition-all ${difficulty === diff ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                {diff}
                                </button>
                            ))}
                        </div>
                     </div>
                 </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Accordions */}
              <div className="space-y-1 md:space-y-2">
                 {/* Formatting & Branding */}
                 <div className="border-b border-slate-100 pb-1 md:pb-2">
                    <button className="w-full flex items-center justify-between py-1.5 md:py-2 text-left group">
                        <div className="flex items-center gap-2 md:gap-3">
                           <Layout className="text-slate-500 w-3 h-3 md:w-4 md:h-4" />
                           <span className="text-xs md:text-sm font-semibold text-slate-700">Formatting & Branding</span>
                        </div>
                        <ChevronDown className="text-slate-400 w-3 h-3 md:w-3.5 md:h-3.5" />
                    </button>
                 </div>

                 {/* Instructions & Content */}
                 <div className="border-b border-slate-100 pb-1 md:pb-2">
                    <button className="w-full flex items-center justify-between py-1.5 md:py-2 text-left group">
                        <div className="flex items-center gap-2 md:gap-3">
                           <FileText className="text-slate-500 w-3 h-3 md:w-4 md:h-4" />
                           <span className="text-xs md:text-sm font-semibold text-slate-700">Instructions & Content</span>
                        </div>
                        <ChevronDown className="text-slate-400 w-3 h-3 md:w-3.5 md:h-3.5" />
                    </button>
                 </div>

                 {/* Student Details */}
                 <div className="border-b border-slate-100 pb-1 md:pb-2">
                    <button className="w-full flex items-center justify-between py-1.5 md:py-2 text-left group">
                        <div className="flex items-center gap-2 md:gap-3">
                           <User className="text-slate-500 w-3 h-3 md:w-4 md:h-4" />
                           <span className="text-xs md:text-sm font-semibold text-slate-700">Student Details</span>
                        </div>
                        <ChevronDown className="text-slate-400 w-3 h-3 md:w-3.5 md:h-3.5" />
                    </button>
                 </div>
                 
                 {/* Footer & Layout */}
                 <div className="pb-1 md:pb-2">
                    <button className="w-full flex items-center justify-between py-1.5 md:py-2 text-left group">
                        <div className="flex items-center gap-2 md:gap-3">
                           <Layout className="text-slate-500 w-3 h-3 md:w-4 md:h-4" />
                           <span className="text-xs md:text-sm font-semibold text-slate-700">Footer & Layout</span>
                        </div>
                        <ChevronDown className="text-slate-400 w-3 h-3 md:w-3.5 md:h-3.5" />
                    </button>
                 </div>
              </div>
          </div>

           {/* Tabs at bottom */}
           <div className="mt-auto border-t border-slate-200 bg-white p-2 md:p-4 pb-3 md:pb-6">
              <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-medium mb-2 md:mb-4 border-b border-slate-100">
                  <button 
                    onClick={() => setActiveTab('questions')}
                    className={`pb-1 md:pb-2 transition-colors relative ${activeTab === 'questions' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                        Select Questions
                        {activeTab === 'questions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('auto')}
                    className={`pb-1 md:pb-2 transition-colors relative ${activeTab === 'auto' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      Auto-Generate
                      {activeTab === 'auto' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                  </button>
              </div>
              <div className="relative group">
                 <Search className="absolute left-2.5 md:left-3 top-2 md:top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                 <input 
                    type="text" 
                    placeholder="Search topics..." 
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-md text-xs md:text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                 />
              </div>
           </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="w-full h-1/2 md:h-auto md:flex-1 bg-slate-100 overflow-hidden relative flex flex-col items-center justify-center p-2 md:p-8 bg-dot-pattern">
           
           <div className="bg-white w-full max-w-[800px] h-[600px] shadow-md border border-slate-200 overflow-y-auto custom-scrollbar relative">
                <div className="bg-white p-6 min-h-[800px] relative font-sans text-slate-900">
                    {/* Watermark */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
                        <div className="text-[50px] font-black text-slate-100 -rotate-45 select-none opacity-50 whitespace-nowrap transform origin-center">
                            Question Hive
                        </div>
                    </div>

                    <div className="relative z-10">
                        {/* Header Section */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 shrink-0 relative">
                                <Image
                                    src="/logo-new.png"
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 text-center">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">St. Xavier's High School</h3>
                                <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Physics Mock Test - 1</h1>
                            </div>
                        </div>

                        {/* Meta Row */}
                        <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-1 font-sans">
                            <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Duration</span>
                                <span className="text-sm font-bold leading-none">180</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Max Marks</span>
                                <span className="text-sm font-bold leading-none">180</span>
                            </div>
                        </div>

                        {/* Inputs Row */}
                        <div className="border-b-2 border-black py-3 mb-3 font-sans">
                            <div className="flex gap-6">
                                <div className="flex-1 flex items-end gap-2">
                                    <span className="text-[11px] font-bold text-slate-600 mb-0.5">Name:</span>
                                    <div className="flex-1 border-b border-slate-300"></div>
                                </div>
                                <div className="flex-1 flex items-end gap-2">
                                    <span className="text-[11px] font-bold text-slate-600 mb-0.5">Roll No:</span>
                                    <div className="flex-1 border-b border-slate-300"></div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="text-center mb-4 font-sans">
                            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Instructions</h4>
                            <ul className="text-[10px] font-medium text-slate-600 space-y-0.5 leading-tight">
                                <li>• All questions are compulsory.</li>
                                <li>• Calculators are not allowed.</li>
                            </ul>
                        </div>

                        <div className="border-b-2 border-black mb-4"></div>

                        {/* Questions Grid - 2 Columns with Divider */}
                        <div className="flex gap-6 relative">
                            {/* Vertical Divider */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -ml-px hidden md:block"></div>

                            {/* Column 1 */}
                            <div className="flex-1 space-y-4">
                                {/* Q1 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">1.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            A small telescope has an objective of focal length 140cm and an eyepiece of focal length 5cm. Its magnifying power for viewing a distant object is:
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) 34</div>
                                            <div>(B) 28</div>
                                            <div>(C) 17</div>
                                            <div>(D) 32</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Q2 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">2.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            For a prism, when the light undergoes minimum deviation, the relationship between the angle of incidence (i) and the angle of emergence (i') is:
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) i = i'</div>
                                            <div>(B) i &gt; i'</div>
                                            <div>(C) i &lt; i'</div>
                                            <div>(D) i = 0</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Q3 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">3.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            A point object is placed at a distance of 60 cm from a convex lens of focal length 30 cm. A plane mirror is placed perpendicular to the lens axis...
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) 20 cm</div>
                                            <div>(B) 30 cm</div>
                                            <div>(C) 30 cm</div>
                                            <div>(D) 20 cm</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Q4 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">4.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            The refractive index of glass is 1.5. What is the speed of light in glass? (Speed of light in vacuum = 3 × 10⁸ m/s)
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) 2 × 10⁸ m/s</div>
                                            <div>(B) 3 × 10⁸ m/s</div>
                                            <div>(C) 1.5 × 10⁸ m/s</div>
                                            <div>(D) 4.5 × 10⁸ m/s</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="flex-1 space-y-4">
                                {/* Q5 (Numbering based on image) */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">5.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            When a biconvex lens of refractive index 1.47 is dipped in a liquid, it behaves like a plane sheet, implying the liquid's refractive index is:
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) 1.47</div>
                                            <div>(B) 1.30</div>
                                            <div>(C) 1.00</div>
                                            <div>(D) 1.60</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Q6 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">6.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            A small telescope has an objective of focal length 140 cm and an eyepiece of focal length 5 cm. Its magnifying power is:
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) 34</div>
                                            <div>(B) 28</div>
                                            <div>(C) 17</div>
                                            <div>(D) 32</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Q7 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">7.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            When a biconvex lens of refractive index 1.47 is dipped in a liquid, it behaves like a plane sheet...
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) 1.47</div>
                                            <div>(B) 1.30</div>
                                            <div>(C) 1.00</div>
                                            <div>(D) 1.60</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Q8 */}
                                <div className="flex gap-2">
                                    <span className="font-bold text-sm">8.</span>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-[11px] leading-tight text-justify font-medium">
                                            Which of the following electromagnetic waves has the highest frequency?
                                        </p>
                                        <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 text-[11px] font-medium text-slate-700">
                                            <div>(A) Radio waves</div>
                                            <div>(B) Microwaves</div>
                                            <div>(C) X-rays</div>
                                            <div>(D) Gamma rays</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
           </div>

           {/* Floating Export Button */}
           <button className="absolute bottom-6 right-6 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl hover:bg-slate-800 transition-all font-medium text-sm z-10">
               <FileText size={16} />
               <span>Export PDF</span>
           </button>

        </div>

      </div>
    </div>
  );
};
