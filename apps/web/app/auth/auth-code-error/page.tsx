'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LogIn, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';
import AppLoader from '../../../components/ui/AppLoader';

function ErrorContent() {
    const searchParams = useSearchParams();
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-indigo-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Please Sign In</h1>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
                To access your account, please sign in.
            </p>

            <div className="space-y-3">
                <Link 
                    href="/auth/login" 
                    className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<AppLoader text="Loading..." />}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
