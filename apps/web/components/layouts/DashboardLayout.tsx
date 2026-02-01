"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X, Home, BookOpen, FileText, BarChart2, Bookmark, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSupabaseAuth } from '../../app/hooks/useSupabaseAuth';
import { signOut } from '../../app/lib/google-auth';

const navItems = [
    { name: 'Dashboard', path: '/home', icon: Home },
    { name: 'Question Bank', path: '/questions', icon: BookOpen },
    { name: 'My Papers', path: '/question-papers', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User }
];

export default function DashboardLayout({ children, fullScreen = false }: { children: React.ReactNode, fullScreen?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false); 
  const pathname = usePathname();
  const { user, loading } = useSupabaseAuth();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  const handleLogout = async () => {
     await signOut();
     window.location.href = "/auth/register";
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans">
      
      {/* Sidebar Navigation - Desktop Only */}
      <aside 
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200 flex-col z-50 transition-all duration-300 shadow-xl lg:shadow-none overflow-hidden
        ${menuOpen ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className={`flex items-center h-20 px-4 transition-all duration-300 ${menuOpen ? 'justify-between' : 'justify-center border-b border-transparent'}`}>
            {/* Logo Section */}
            <div className={`flex items-center gap-3 font-bold text-xl text-indigo-600 transition-all duration-200 overflow-hidden whitespace-nowrap ${menuOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                <img src="/logo-new.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-md shrink-0" />
                <span>Question Hive</span>
            </div>
        </div>
        
        <nav className="flex flex-col gap-2 px-3 mt-4">
            {navItems.map((item) => (
                <Link 
                    key={item.path}
                    href={item.path} 
                    className={`group p-3 rounded-xl flex items-center gap-3 font-medium transition-all duration-300
                    ${isActive(item.path) ? 'bg-indigo-50 text-blue-900 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-900'}
                    ${!menuOpen ? 'justify-center px-0' : ''}
                    `}
                    title={!menuOpen ? item.name : ''}
                >
                    <item.icon className={`shrink-0 w-6 h-6 transition-colors ${isActive(item.path) ? 'stroke-blue-900' : 'stroke-slate-400 group-hover:stroke-blue-900'}`} />
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
      <main className={`flex-1 w-full min-h-screen transition-all duration-300 relative lg:ml-20 ${menuOpen ? 'lg:ml-64' : ''}`}>
        
        <div className={`${fullScreen ? "pt-6 lg:pt-0" : "p-6 lg:p-10 pt-6 lg:pt-12"} pb-24 lg:pb-10`}>
            {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl z-50 px-2 py-3 flex justify-between items-center ring-1 ring-slate-900/5">
        {navItems.map((item) => {
            const active = isActive(item.path);
            return (
                <Link 
                    key={item.path}
                    href={item.path}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full relative group
                    ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {active && (
                       <span className="absolute -top-1 w-1 h-1 rounded-full bg-indigo-600"></span> 
                    )}
                    <item.icon className={`w-5 h-5 mb-1 ${active && 'fill-indigo-600/10'}`} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-[9px] font-bold tracking-tight">{item.name}</span>
                </Link>
            )
        })}
      </div>
      
    </div>
  );
}
