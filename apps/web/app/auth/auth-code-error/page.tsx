'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    // Try to get error from query params, though often it's in the hash which is harder to read server-side
    // but client side can see it? hash isn't in searchParams. 
    // We'll just provide a generic message since we know typical causes.
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Error</h1>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
                We couldn't verify your sign-in link. It may have expired or already been used.
            </p>

            <div className="space-y-3">
                <Link 
                    href="/auth/login" 
                    className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                    Back to Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                
                <p className="text-xs text-slate-400 mt-4">
                    If the issue persists, try requesting a new link.
                </p>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
