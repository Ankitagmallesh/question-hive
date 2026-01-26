"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, animate, useInView } from "framer-motion";
import { GraduationCap, Landmark, Trash2, Coins } from "lucide-react";
import { GraduationCap, Landmark, Trash2, Coins } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AppLoader from "../../components/ui/AppLoader";
import { getSupabase } from "../lib/supabase-client";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";

// CountUp Component
// CountUp Component
const CountUp = ({ to }: { to: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  
  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: 2,
        onUpdate: (value) => setDisplayValue(Math.floor(value)),
        ease: "easeOut"
      });
      return controls.stop;
    }
  }, [to, isInView]);

  return <span ref={ref}>{displayValue}</span>;
};

// Animated Progress Bar
// Animated Progress Bar
const AnimatedProgressBar = ({ width, colorClass }: { width: string, colorClass: string }) => {
  return (
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className={`h-full ${colorClass}`} 
      />
    </div>
  );
};

import { useRouter } from 'next/navigation';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const { user } = useSupabaseAuth();
  const { user } = useSupabaseAuth();

  const [stats, setStats] = useState<{
    totalQuestions: number;
    totalPapers: number;
    typeBreakdown: { type: string; count: number }[];
    difficultyBreakdown: { difficulty: string; count: number }[];
    recentPapers: unknown[];
  }>({
    totalQuestions: 0,
    totalPapers: 0,
    typeBreakdown: [],
    difficultyBreakdown: [],
    recentPapers: []
  });
  const [userName, setUserName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            const meta = session.user.user_metadata;
            if (meta?.full_name) {
                let displayName = meta.full_name;
                 // Remove title if present to get just the name
                if (meta.title && displayName.startsWith(meta.title)) {
                    displayName = displayName.substring(meta.title.length).trim();
                }
                // Get first word as first name
                setUserName(displayName.split(' ')[0]);
            }
        }

        if (!session?.user?.email) return;

        const res = await fetch(`/api/dashboard/stats?email=${session.user.email}`);
        const data = await res.json();
        if (data.success) {
            setStats({
                ...data.stats,
                recentPapers: data.recentPapers || []
            });
        }
    } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
  useEffect(() => {
    fetchStats();
  }, []);

  const getCountByType = (typeName: string) => {
    if (!stats.typeBreakdown) return 0;
    const type = stats.typeBreakdown.find(t => t.type?.toLowerCase().includes(typeName.toLowerCase()));
    return type ? type.count : 0;
  };

  const getDifficultyPercent = (levelName: string) => {
      if (!stats.difficultyBreakdown || stats.difficultyBreakdown.length === 0) return 0;
      const totalDBQuestions = stats.difficultyBreakdown.reduce((acc, curr) => acc + (curr.count || 0), 0);
      if (totalDBQuestions === 0) return 0;
      
      const level = stats.difficultyBreakdown.find(d => d.difficulty?.toLowerCase().includes(levelName.toLowerCase()));
      return level ? Math.round((level.count / totalDBQuestions) * 100) : 0;
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
          return;
      }

      try {
          const res = await fetch(`/api/question-papers/${id}`, {
              method: 'DELETE'
          });
          const data = await res.json();
          
          if (data.success) {
              await fetchStats(); 
              await fetchStats(); 
          } else {
              alert('Failed to delete: ' + data.error);
          }
      } catch (error) {
          console.error("Delete failed", error);
          alert('An error occurred while deleting.');
      }
  };


  return (
    <DashboardLayout>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-10">
            <div>
                <h1 className="text-3xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Welcome back, <br className="lg:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userName || 'User'}!</span>
                </h1>
                <p className="text-sm text-slate-500 font-medium italic mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {currentDate}
                </p>
            </div>
            
            <div className="relative group w-full md:w-auto mt-4 md:mt-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 to-indigo-200 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative flex flex-col gap-2 bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 w-full md:min-w-[240px]">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                <Coins className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credits</p>
                                <p className="text-xs font-bold text-slate-900 leading-none">Available Balance</p>
                            </div>
                        </div>
                        <span className={`text-sm font-black ${(user?.credits ?? 0) === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                            {user?.credits ?? 0}
                            <span className="text-[10px] text-slate-400 font-bold ml-0.5">/ 150</span>
                        </span>
                    </div>
                    
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(((user?.credits ?? 0) / 150) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                                (user?.credits ?? 0) < 20 ? 'bg-red-500' : 
                                (user?.credits ?? 0) < 50 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                        />
                    </div>
                </div>
            </div>
        </header>

        {/* Stats Grid - 2 Col on Mobile, 3 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-8">
             {/* Card 1 */}
            <div className="col-span-1 bg-gradient-to-br from-white to-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -top-4 p-4 opacity-[0.15] group-hover:opacity-25 transition-opacity rotate-12">
                     <svg className="w-24 h-24 text-indigo-600" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Total Questions</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        <CountUp to={stats.totalQuestions} />
                        </h2>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available</span>
                    </div>
                </div>
            </div>

            {/* Card 2 */}
            <div className="col-span-1 bg-gradient-to-br from-white to-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -top-4 p-4 opacity-[0.15] group-hover:opacity-25 transition-opacity rotate-12">
                     <svg className="w-24 h-24 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Exam Papers</p>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                        <CountUp to={stats.totalPapers} />
                        </h2>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created</span>
                    </div>
                </div>
            </div>

             {/* Card 3 - Full Width on Mobile, but unified style */}
            <Link href="/question-papers" className="col-span-2 md:col-span-1 relative overflow-hidden rounded-[1.5rem] p-6 flex flex-col justify-between shadow-xl shadow-indigo-200 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer min-h-[140px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        NEW
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform shadow-sm">
                         <span className="text-2xl">✨</span>
                    </div>
                </div>

                <div className="relative z-10 mt-4">
                    <p className="text-white text-2xl font-black leading-tight tracking-tight">AI Generator</p>
                    <p className="text-indigo-100/80 text-xs font-semibold mt-1">Instant Question Papers</p>
                </div>
            </Link>
        </div>

        <section className="mb-8 relative z-20">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-lg"></div>
                <div className="relative bg-white p-2 rounded-[1.5rem] shadow-xl shadow-indigo-100 border border-slate-100 flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-4 border border-transparent focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                        <svg className="w-5 h-5 text-slate-400 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    router.push(`/question-papers/create?auto_query=${encodeURIComponent(searchQuery)}`);
                                }
                            }}
                            placeholder="Describe your paper (e.g. 'Class 12 Physics Kinetics')..." 
                            className="bg-transparent flex-1 py-4 focus:outline-none text-slate-800 font-semibold placeholder:text-slate-400 w-full text-sm" 
                        />
                    </div>
                    <button 
                        onClick={() => {
                            if (searchQuery.trim()) {
                                router.push(`/question-papers/create?auto_query=${encodeURIComponent(searchQuery)}`);
                            } else {
                                router.push('/question-papers');
                            }
                        }}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-indigo-600 active:scale-95 transition-all duration-200 shadow-lg shadow-slate-900/20 w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <span>Generate</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                </div>
            </div>
        </section>

        <section className="mb-8 md:mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/question-papers" className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-6 shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                     <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Manual Mode</p>
                            <h3 className="text-white text-lg font-bold">Create Paper</h3>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-blue-600 text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        </div>
                    </div>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                    <Link href="/questions" className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-indigo-200 hover:shadow-md transition-all active:scale-95">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700">Questions</span>
                    </Link>
                    <Link href="/question-papers" className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-200 hover:shadow-md transition-all active:scale-95">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700">Examples</span>
                    </Link>
                </div>
            </div>
        </section>

        <section className="mb-6 lg:mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 card-shadow p-5 lg:p-8 rounded-[2rem] relative overflow-hidden bg-white">
                <div className="flex justify-between items-start mb-6 lg:mb-8 relative z-10">
                    <div>
                        <h3 className="font-bold text-lg lg:text-xl text-slate-900">Question Type Breakdown</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Distribution by format across all subjects</p>
                    </div>
                </div>
            
                <div className="space-y-6 relative z-10">
                    
                    {/* MCQ */}
                    <div>
                        <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <span className="w-5 h-5 bg-black rounded flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Multiple Choice (MCQ)</h4>
                                        <p className="text-xs text-slate-500">Standard 4-option format</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-slate-900"><CountUp to={getCountByType('Multiple Choice')} /></span> <span className="text-[10px] font-bold text-slate-400 uppercase">Qs</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(stats.totalQuestions > 0 ? (getCountByType('Multiple Choice') / stats.totalQuestions) * 100 : 0)}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-blue-500" 
                                      />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Numerical */}
                    <div>
                         <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-[10px] text-white font-bold leading-none">
                                    12<br/>34
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Numerical Value</h4>
                                        <p className="text-xs text-slate-500">Integer type answers</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-slate-900"><CountUp to={getCountByType('Numerical')} /></span> <span className="text-[10px] font-bold text-slate-400 uppercase">Qs</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(stats.totalQuestions > 0 ? (getCountByType('Numerical') / stats.totalQuestions) * 100 : 0)}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                        className="h-full bg-purple-500" 
                                      />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assertion */}
                    <div>
                         <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Assertion & Reasoning</h4>
                                        <p className="text-xs text-slate-500">Logic based evaluation</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-slate-900"><CountUp to={getCountByType('Reasoning')} /></span> <span className="text-[10px] font-bold text-slate-400 uppercase">Qs</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(stats.totalQuestions > 0 ? (getCountByType('Reasoning') / stats.totalQuestions) * 100 : 0)}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                        className="h-full bg-amber-500" 
                                      />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center z-10 relative">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Most Used Format</span>
                     <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                        MCQs ({Math.round((stats.totalQuestions > 0 ? (getCountByType('Multiple Choice') / stats.totalQuestions) * 100 : 0))}%)
                     </div>
                </div>
            </div>

            <div className="card-shadow p-5 lg:p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 z-10">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Question Bank</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Difficulty Distribution</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 z-10">
                    <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-500" 
                         style={{ background: `conic-gradient(#4f46e5 0% ${getDifficultyPercent('Hard')}%, #10b981 ${getDifficultyPercent('Hard')}% ${getDifficultyPercent('Hard') + getDifficultyPercent('Medium')}%, #f59e0b ${getDifficultyPercent('Hard') + getDifficultyPercent('Medium')}% 100%)` }}>
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                            <span className="text-xl lg:text-2xl font-black text-slate-800"><CountUp to={stats.difficultyBreakdown.reduce((acc, curr) => acc + curr.count, 0)} /></span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                    </div>

                    <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                                <span className="text-xs font-bold text-slate-600">Hard</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900"><CountUp to={getDifficultyPercent('Hard')} />%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-bold text-slate-600">Med</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900"><CountUp to={getDifficultyPercent('Medium')} />%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                <span className="text-xs font-bold text-slate-600">Easy</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900"><CountUp to={getDifficultyPercent('Easy')} />%</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 z-10">
                     <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-[10px] font-bold leading-tight">Low on "Hard" Qs for Biology.</p>
                     </div>
                </div>
                <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-indigo-50 rounded-full z-0"></div>
            </div>
        </section>

        <div className="grid grid-cols-1 gap-8 pb-10">
            <div className="w-full card-shadow p-5 lg:p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg lg:text-xl text-slate-900">Recent Assessments</h3>
                    <button className="text-indigo-600 font-bold text-sm hover:underline cursor-pointer">View All</button>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading recent papers...</div>
                    ) : stats.recentPapers.length > 0 ? (
                        stats.recentPapers.map((paper: { id: string; title: string; updatedAt: string; status?: string }) => (
                            <Link href={`/question-papers/create?savedId=${paper.id}`} key={paper.id}>
                                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between group cursor-pointer hover:bg-white transition-all shadow-sm mb-3 gap-3 sm:gap-0">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl shrink-0">
                                            {paper.title.toLowerCase().includes('math') ? '📐' : 
                                             paper.title.toLowerCase().includes('chem') ? '🧪' :
                                             paper.title.toLowerCase().includes('phy') ? '⚡' : '📝'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{paper.title}</p>
                                            <p className="text-[10px] text-slate-400">Edited {new Date(paper.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pl-14 sm:pl-0">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                            paper.status === 'Published' ? 'bg-green-100 text-green-700' : 
                                            paper.status === 'Saved' ? 'bg-indigo-100 text-indigo-700' : 
                                            'bg-slate-200 text-slate-600'
                                        }`}>
                                            {paper.status || 'Draft'}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                            <button 
                                                onClick={(e) => handleDelete(e, paper.id)}
                                                className="p-2 -mr-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                         <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                            No recent assessments found. Create your first paper!
                        </div>
                    )}
                </div>
            </div>
        </div>
    </DashboardLayout>
  );
}