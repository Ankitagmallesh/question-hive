"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, animate, useInView } from "framer-motion";
import { GraduationCap, Landmark, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";

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

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalPapers: 0,
    typeBreakdown: [] as any[],
    difficultyBreakdown: [] as any[],
    recentPapers: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    fetchStats();


  }, []);

  const getCountByType = (typeName: string) => {
    const type = stats.typeBreakdown.find(t => t.type.toLowerCase().includes(typeName.toLowerCase()));
    return type ? type.count : 0;
  };

  const getDifficultyPercent = (levelName: string) => {
      const totalDBQuestions = stats.difficultyBreakdown.reduce((acc, curr) => acc + curr.count, 0);
      if (totalDBQuestions === 0) return 0;
      
      const level = stats.difficultyBreakdown.find(d => d.difficulty.toLowerCase().includes(levelName.toLowerCase()));
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
              setStats(prev => ({
                  ...prev,
                  recentPapers: prev.recentPapers.filter(p => p.id !== id),
                  totalPapers: Math.max(0, prev.totalPapers - 1)
              }));
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
        <header className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back, <span className="text-indigo-600">Sanjay!</span></h1>
                <p className="text-slate-500 font-medium italic">{currentDate}</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-shadow p-6 rounded-3xl hover-lift">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Questions</p>
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-black mt-1 text-slate-900">
                       <CountUp to={stats.totalQuestions} />
                    </h2>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">↑ 12%</div>
                </div>
            </div>
            <div className="card-shadow p-6 rounded-3xl hover-lift">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Exam Papers</p>
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-black mt-1 text-slate-900">
                       <CountUp to={stats.totalPapers} />
                    </h2>
                    <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-bold">+2 Today</div>
                </div>
            </div>
            <Link href="/question-papers" className="ai-gradient hover:opacity-90 transition-all rounded-3xl p-6 flex items-center justify-between shadow-lg shadow-indigo-200 group hover-lift w-full text-left cursor-pointer">
                <div className="text-left text-white">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Instant Build</p>
                    <p className="text-xl font-bold">AI Generator</p>
                </div>
                <span className="text-3xl group-hover:rotate-12 transition-transform">✨</span>
            </Link>
        </div>

        <section className="mb-8">
            <div className="bg-white border-2 border-indigo-50 p-1.5 rounded-2xl flex items-center shadow-sm focus-within:border-indigo-400 transition-all">
                <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white mr-2 shadow-lg shadow-indigo-200 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                </div>
                <input type="text" placeholder="Create a 30-mark NEET Physics paper on Laws of Motion..." className="bg-transparent flex-1 p-3 focus:outline-none text-slate-700 font-medium w-full" />
                <Link href="/question-papers" className="hidden sm:block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors cursor-pointer">Generate</Link>
            </div>
        </section>

        <section className="mb-8 card-shadow p-8 rounded-[2rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Link href="/question-papers" className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md shadow-blue-100 hover-lift text-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Create Question Paper
                </Link>
                <Link href="/question-papers" className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md shadow-emerald-100 hover-lift">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    View Examples
                </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/questions" className="bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
                        <span className="font-bold text-xs">Add Question</span>
                    </Link>
                    <Link href="/questions" className="bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span className="font-bold text-xs">Browse Questions</span>
                    </Link>
                    <Link href="/question-papers" className="bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                        <span className="font-bold text-xs">Templates</span>
                    </Link>
                </div>
            </div>
        </section>



        <section className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card-shadow p-8 rounded-[2rem] relative overflow-hidden bg-white">
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">Question Type Breakdown</h3>
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

            <div className="card-shadow p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 z-10">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Question Bank</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Difficulty Distribution</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 z-10">
                    <div className="relative w-32 h-32 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-500" 
                         style={{ background: `conic-gradient(#4f46e5 0% ${getDifficultyPercent('Hard')}%, #10b981 ${getDifficultyPercent('Hard')}% ${getDifficultyPercent('Hard') + getDifficultyPercent('Medium')}%, #f59e0b ${getDifficultyPercent('Hard') + getDifficultyPercent('Medium')}% 100%)` }}>
                        <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                            <span className="text-2xl font-black text-slate-800"><CountUp to={stats.difficultyBreakdown.reduce((acc, curr) => acc + curr.count, 0)} /></span>
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
            <div className="w-full card-shadow p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-900">Recent Assessments</h3>
                    <button className="text-indigo-600 font-bold text-sm hover:underline cursor-pointer">View All</button>
                </div>
                <div className="space-y-3">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading recent papers...</div>
                    ) : stats.recentPapers.length > 0 ? (
                        stats.recentPapers.map((paper: any) => (
                            <Link href={`/question-papers/create?savedId=${paper.id}`} key={paper.id}>
                                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white transition-all shadow-sm mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                                            {paper.title.toLowerCase().includes('math') ? '📐' : 
                                             paper.title.toLowerCase().includes('chem') ? '🧪' :
                                             paper.title.toLowerCase().includes('phy') ? '⚡' : '📝'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{paper.title}</p>
                                            <p className="text-[10px] text-slate-400">Edited {new Date(paper.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                            paper.status === 'Published' ? 'bg-green-100 text-green-700' : 
                                            paper.status === 'Saved' ? 'bg-indigo-100 text-indigo-700' : 
                                            'bg-slate-200 text-slate-600'
                                        }`}>
                                            {paper.status || 'Draft'}
                                        </span>
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