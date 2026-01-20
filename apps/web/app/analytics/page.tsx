"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import DashboardLayout from "../../components/layouts/DashboardLayout";

// CountUp Component for animated numbers
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

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
};

// Animated Bar for visual graphs (Horizontal)
const AnimatedBar = ({ width, colorClass, shadowColor }: { width: string, colorClass: string, shadowColor?: string }) => {
    return (
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full ${colorClass}`}
                style={shadowColor ? { boxShadow: `0 0 10px ${shadowColor}` } : {}}
            />
        </div>
    );
};

// Animated Height Bar for Vertical Graphs
const AnimatedHeightBar = ({ height, colorClass, delay = 0 }: { height: string, colorClass: string, delay?: number }) => {
    return (
        <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut", delay }}
            className={`w-full rounded-t-2xl ${colorClass}`}
        />
    );
};

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
        <div className="relative min-h-screen">
            {/* Overlay */}
            <div className="absolute inset-0 z-50 flex items-start justify-center pt-32 bg-white/40 backdrop-blur-[3px] rounded-[3rem]">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-indigo-100 text-center animate-in fade-in zoom-in duration-500">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Coming Soon</h2>
                    <p className="text-slate-500 font-medium">Advanced analytics are under construction.</p>
                </div>
            </div>

            {/* Content with Blur Effect */}
            <div className="pointer-events-none select-none">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <nav className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">System Reports</nav>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            Paper <span className="text-indigo-600">Analytics</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">Filter</button>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 cursor-pointer">Export Report</button>
                    </div>
                </header>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* Total Questions Card */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-8 rounded-[2rem] bg-indigo-600 text-white border-none relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Total Questions</p>
                                <h2 className="text-5xl font-black italic">
                                    <CountUp to={1245} />
                                </h2>
                            </div>
                            <motion.span 
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                className="bg-white/20 p-3 rounded-2xl text-2xl cursor-pointer inline-block"
                            >
                                📚
                            </motion.span>
                        </div>
                        <div className="mt-6 flex gap-2 relative z-10">
                            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded">Active Bank</span>
                            <span className="text-[10px] font-bold bg-emerald-400/20 text-emerald-300 px-2 py-1 rounded">+120 this month</span>
                        </div>
                    </div>

                    {/* Papers Created Card */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-lg transition-shadow duration-300">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Papers Created</p>
                        <div className="flex items-end gap-3">
                            <h2 className="text-5xl font-black text-slate-900 italic">
                                <CountUp to={42} />
                            </h2>
                            <span className="text-indigo-600 font-bold text-sm mb-1 uppercase tracking-tighter">Draft + Final</span>
                        </div>
                        <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full w-[66%]" />
                        </div>
                    </div>

                    {/* Total Exports Card */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border-2 border-emerald-100 p-8 rounded-[2rem] hover:border-emerald-200 transition-colors duration-300">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Exports</p>
                        <div className="flex items-end gap-3">
                            <h2 className="text-5xl font-black text-emerald-600 italic">
                                <CountUp to={89} />
                            </h2>
                            <span className="text-emerald-500 font-bold text-sm mb-1 uppercase tracking-tighter">PDFs Generated</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold italic">Used by 12 departments</span>
                        </div>
                    </div>
                </div>

                {/* Charts Section 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Highest Subjects */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col h-full">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2 text-slate-900">
                            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span> Highest Subjects
                        </h3>
                        <div className="space-y-6 flex-1">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span>Physics</span>
                                    <span className="text-indigo-600"><CountUp to={420} /> Qs</span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 w-[85%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span>Mathematics</span>
                                    <span className="text-slate-500"><CountUp to={310} /> Qs</span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 w-[65%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2 text-slate-400">
                                    <span>Chemistry</span>
                                    <span><CountUp to={150} /> Qs</span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-300 w-[35%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Activity Graph */}
                    <div className="lg:col-span-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Export Activity Graph</h3>
                                <p className="text-xs text-slate-400 italic font-medium mt-1">Tracking PDF generation frequency</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Monthly</div>
                            </div>
                        </div>
                        <div className="h-56 w-full flex items-end justify-between gap-3 px-2">
                            {/* Static Bars for Disabled View */}
                            <div className="w-full h-[20%] bg-indigo-50 rounded-t-2xl"></div>
                            <div className="w-full h-[35%] bg-indigo-100 rounded-t-2xl"></div>
                            <div className="w-full h-[45%] bg-indigo-200 rounded-t-2xl"></div>
                            <div className="w-full h-[65%] bg-indigo-300 rounded-t-2xl"></div>
                            <div className="w-full h-[85%] bg-indigo-400 rounded-t-2xl"></div>
                            <div className="w-full h-[95%] bg-indigo-600 rounded-t-2xl shadow-lg shadow-indigo-100"></div>
                        </div>
                        <div className="flex justify-between mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        </div>
                    </div>
                </div>

                {/* Charts Section 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Efficiency Index */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full animate-pulse"></div>
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⏱️</div>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Efficiency Index</p>
                        <h2 className="text-6xl font-black italic text-indigo-400">
                            <CountUp to={222} />
                        </h2>
                        <p className="text-lg font-bold mt-1 tracking-tight text-white">Hours Saved</p>
                        <p className="text-[10px] text-white/60 mt-6 leading-relaxed max-w-[150px]">Auto-formatting saved you 2.5 hours per paper exported.</p>
                    </div>

                    {/* Format Table */}
                    <div className="lg:col-span-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2.5rem]">
                        <h3 className="font-bold text-xl text-slate-900 mb-8">Format & Difficulty Mix</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                                        <th className="pb-4">Exam Format</th>
                                        <th className="pb-4 text-center">Easy</th>
                                        <th className="pb-4 text-center">Medium</th>
                                        <th className="pb-4 text-center">Hard</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr>
                                        <td className="py-5 font-bold text-sm">JEE Main</td>
                                        <td className="py-5 text-center text-xs font-semibold text-slate-500">15%</td>
                                        <td className="py-5 text-center text-xs font-semibold text-slate-500">45%</td>
                                        <td className="py-5 text-center text-xs font-black text-indigo-600">40%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 font-bold text-sm">NEET UG</td>
                                        <td className="py-5 text-center text-xs font-semibold text-slate-500">30%</td>
                                        <td className="py-5 text-center text-xs font-black text-amber-600">55%</td>
                                        <td className="py-5 text-center text-xs font-semibold text-slate-500">15%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 font-bold text-sm">K-CET</td>
                                        <td className="py-5 text-center text-xs font-black text-emerald-600">60%</td>
                                        <td className="py-5 text-center text-xs font-semibold text-slate-500">30%</td>
                                        <td className="py-5 text-center text-xs font-semibold text-slate-500">10%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Breakdown Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Difficulty Weightage */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2.5rem]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Difficulty Weightage</h3>
                                <p className="text-xs text-slate-400 italic font-medium mt-1">Average across all generated papers</p>
                            </div>
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-indigo-100">Balanced</span>
                        </div>
            
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Easy</span>
                                    <span className="text-slate-800">25%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-400 w-[25%]" />
                                </div>
                            </div>
                            {/* ... other bars ... */}
                        </div>
                    </div>
            
                    {/* Recent Papers Breakdown */}
                    <div className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col justify-between">
                         <div className="mb-6">
                            <h3 className="font-bold text-xl text-slate-900">Recent Papers Breakdown</h3>
                            <p className="text-xs text-slate-400 italic font-medium mt-1">Weightage composition per export</p>
                         </div>

                         <div className="space-y-5">
                            {/* Static Bars */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-700">Physics_Unit_04</span>
                                    <span className="text-slate-400 text-[10px]">Standard</span>
                                </div>
                                <div className="w-full h-4 rounded-lg overflow-hidden flex">
                                    <div className="bg-emerald-400 h-full w-[30%]" />
                                    <div className="bg-amber-400 h-full w-[50%]" />
                                    <div className="bg-rose-500 h-full w-[20%]" />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <section className="shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] bg-white border border-slate-200 p-8 rounded-[2.5rem] mb-12">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-slate-900">Recent Export Activity</h3>
                        <button className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View History</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📄</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Physics_NEET_Unit_04.pdf</p>
                                    <p className="text-xs text-slate-400 font-semibold italic">Exported 14 mins ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </DashboardLayout>
  );
}
