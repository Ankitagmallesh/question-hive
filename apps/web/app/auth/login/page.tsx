'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";
import { getSupabase } from "../../lib/supabase-client";
import AppLoader from "../../../components/ui/AppLoader";
// Lucide icons
import { Check, ShieldCheck, Lock, Hexagon, Eye, EyeOff } from "lucide-react";
import { getSupabase } from "../../lib/supabase-client";
import AppLoader from "../../../components/ui/AppLoader";
// Lucide icons
import { Check, ShieldCheck, Lock, Hexagon, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    useEffect(() => {
        (async () => {
            try {
                const supabase = getSupabase();
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    router.replace('/home');
                } else {
                    setIsCheckingSession(false);
                }
            } catch (err) {
                setIsCheckingSession(false);
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Session check failed:', err);
                }
            }
                // Reusing getSession from google-auth for now as it probably wraps supabase.auth.getSession
                // Actually, I should check if I deleted the import... I am deleting it below.
                // The original code used getSession from ../../lib/google-auth. 
                // I need to import getSession or implement it. 
                // Let's verify what getSession does. 
                // Since I am removing the import `import { signInWithGoogle, getSession } from "../../lib/google-auth";`
                // I need to make sure I don't break the useEffect check.
                // I will replace `getSession()` with a direct supabase check or keep the import for getSession only if needed.
                // But wait, the previous `getSession` was likely just checking supabase session.
                // I'll use `getSupabase().auth.getSession()` directly to be safe and clean.
                const supabase = getSupabase();
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    router.replace('/home');
                } else {
                    setIsCheckingSession(false);
                }
            } catch {
                setIsCheckingSession(false);
            }
        })();
    }, [router]);

    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <AppLoader text="Verifying session..." />
            </div>
        );
    }
    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <AppLoader text="Verifying session..." />
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        
        if (!formData.password) newErrors.password = 'Password is required';
        
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        
        if (!formData.password) newErrors.password = 'Password is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const supabase = getSupabase();
            const { data, error } = await supabase.auth.signInWithPassword({
            const supabase = getSupabase();
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) {
                console.error('Login error:', error);
                // Check for invalid credentials
                if (error.message === 'Invalid login credentials') {
                    setErrors({ general: 'Incorrect email or password. Please try again.' });
                } else {
                    setErrors({ general: error.message });
                }
            } else if (data.session) {
                // Success
                localStorage.setItem('auth_token', data.session.access_token);
                apiClient.setAuthToken(data.session.access_token);
                if (data.session.refresh_token) {
                    localStorage.setItem('refresh_token', data.session.refresh_token);
            });

            if (error) {
                console.error('Login error:', error);
                // Check for invalid credentials
                if (error.message === 'Invalid login credentials') {
                    setErrors({ general: 'Incorrect email or password. Please try again.' });
                } else {
                    setErrors({ general: error.message });
                }
            } else if (data.session) {
                // Success
                localStorage.setItem('auth_token', data.session.access_token);
                apiClient.setAuthToken(data.session.access_token);
                if (data.session.refresh_token) {
                    localStorage.setItem('refresh_token', data.session.refresh_token);
                }
                router.push('/home');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-white text-slate-900">
            {/* Left Side - Promotional/Testimonial */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

                <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
                    <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                    Question Hive
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> New Feature
                        </div>
                        <h2 className="text-3xl font-serif leading-tight">
                            &quot;The new AI-Assisted Grading has saved our department countless hours this semester.&quot;
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Avatar removed */}
                        <div>
                            <p className="font-bold text-white">Prof. Sarah Jenkins</p>
                            <p className="text-sm text-slate-400">Head of Mathematics, Stanford High</p>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Secure Institutional Access</p>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>SSO Enabled</span>
                        <span className="mx-2">•</span>
                        <Lock className="w-4 h-4 text-emerald-500" />
                        <span>End-to-End Encrypted</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-7/12 h-full overflow-y-auto bg-white" data-lenis-prevent>
                <div className="w-full min-h-full flex flex-col justify-center items-center py-12 lg:py-20 px-6">
                    <div className="max-w-md w-full">
                    
                        <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-indigo-600 mb-8">
                            <img src="/logo-new.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                            Question Hive
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                            <p className="text-slate-500">Please enter your details to access your dashboard.</p>
                        </div>

                <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Secure Institutional Access</p>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>SSO Enabled</span>
                        <span className="mx-2">•</span>
                        <Lock className="w-4 h-4 text-emerald-500" />
                        <span>End-to-End Encrypted</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-7/12 h-full overflow-y-auto bg-white" data-lenis-prevent>
                <div className="w-full min-h-full flex flex-col justify-center items-center py-12 lg:py-20 px-6">
                    <div className="max-w-md w-full">
                    
                        <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-indigo-600 mb-8">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                               <Hexagon className="w-5 h-5 fill-indigo-600 text-white" />
                            </div>
                            Question Hive
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                            <p className="text-slate-500">Please enter your details to access your dashboard.</p>
                        </div>

                        {errors.general && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {errors.general}
                            </div>
                        )}
                        
                         {!hasSupabaseEnv && (
                             <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                                Supabase keys missing in .env.local used for OAuth
                        
                         {!hasSupabaseEnv && (
                             <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                                Supabase keys missing in .env.local used for OAuth
                            </div>
                        )}
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email address</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@university.edu" 
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                            />
                            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email address</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@university.edu" 
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                            />
                            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password" 
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all pr-10"
                                    placeholder="Enter your password" 
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                        </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input 
                                    id="remember-me" 
                                    name="rememberMe" 
                                    type="checkbox" 
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" 
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">Remember me for 30 days</label>
                            </div>
                            <div className="text-sm">
                                <Link href="/auth/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">Forgot password?</Link>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input 
                                    id="remember-me" 
                                    name="rememberMe" 
                                    type="checkbox" 
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" 
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">Remember me for 30 days</label>
                            </div>
                            <div className="text-sm">
                                <Link href="/auth/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">Forgot password?</Link>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>


                    <div className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account? <Link href="/auth/register" className="font-bold text-indigo-600 hover:underline">Apply for access</Link>
                    </div>
                </div>
            </div>
        </div>
    </div>

                    <div className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account? <Link href="/auth/register" className="font-bold text-indigo-600 hover:underline">Apply for access</Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}