"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSupabaseAuth } from '../../app/hooks/useSupabaseAuth';
import { signOut } from '../../app/lib/google-auth';


export default function DashboardLayout({ children, fullScreen = false }: { children: React.ReactNode, fullScreen?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false); 
  const pathname = usePathname();
  const { user, loading } = useSupabaseAuth();

  // Removed localStorage restoration to ensure it always starts closed as requested

  const toggleMenu = () => {
      const newState = !menuOpen;
      setMenuOpen(newState);
      // localStorage.setItem('sidebar_open', String(newState)); // Don't persist if we always want it closed on refresh
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  const handleLogout = async () => {
     await signOut();
     window.location.href = "/auth/register";
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 shadow-xl lg:shadow-none overflow-hidden
        ${menuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className={`flex items-center h-20 px-4 transition-all duration-300 ${menuOpen ? 'justify-between' : 'justify-center border-b border-transparent'}`}>
            {/* Logo Section - Visible only when Open */}
            <div className={`flex items-center gap-3 font-bold text-xl text-indigo-600 transition-all duration-200 overflow-hidden whitespace-nowrap ${menuOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span>Question Hive</span>
            </div>

            {/* Toggle Button (Internal) */}
            {/* Hidden since we use hover/auto-close now, but kept for mobile logic if needed */}
            <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className={`p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer ${!menuOpen ? 'hidden' : ''}`}
            >
                <Menu className="w-6 h-6" />
            </button>
        </div>
        
        <nav className="flex flex-col gap-2 px-3 mt-4">
            {[
                { name: 'Dashboard', path: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { name: 'Question Bank', path: '/questions', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { name: 'My Papers', path: '/question-papers', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { name: 'Analytics', path: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { name: 'Saved Papers', path: '/saved', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
                { name: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ].map((item) => (
                <Link 
                    key={item.path}
                    href={item.path} 
                    onClick={() => setMenuOpen(false)}
                    className={`group p-3 rounded-xl flex items-center gap-3 font-medium transition-all duration-300
                    ${isActive(item.path) ? 'bg-indigo-50 text-blue-900 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-900'}
                    ${!menuOpen ? 'justify-center px-0' : ''}
                    `}
                    title={!menuOpen ? item.name : ''}
                >
                    <svg className={`shrink-0 w-6 h-6 transition-colors ${isActive(item.path) ? 'stroke-blue-900' : 'stroke-slate-400 group-hover:stroke-blue-900'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${menuOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                        {item.name}
                    </span>
                </Link>
            ))}
        </nav>

        <div className={`mt-auto p-4 transition-all duration-300 ${!menuOpen ? 'opacity-0 pointer-events-none w-0 p-0' : 'opacity-100'}`}>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-[14rem]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Storage Usage</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-3/4"></div>
                </div>
                <p className="text-[11px] mt-2 text-slate-600 font-semibold">750 / 1000 Questions</p>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 w-full min-h-screen transition-all duration-300 relative ${menuOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        
        {/* Mobile Toggle (Floating) - Only visible on Mobile when closed, to reopen */}
        {!menuOpen && (
            <div className="absolute top-6 left-6 z-10 lg:hidden">
                 <button onClick={toggleMenu} className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                    <Menu className="w-6 h-6" />
                 </button>
            </div>
        )}
        


        <div className={fullScreen ? "pt-20 lg:pt-0" : "p-6 lg:p-10 pt-20 lg:pt-12"}>
            {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
