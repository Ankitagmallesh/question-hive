'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";
import { getSupabase } from "../../lib/supabase-client";
import { signInWithGoogle, getSession } from "../../lib/google-auth";
// Lucide icons
import { Hexagon, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: 'Prof.',
        name: '',
        email: '',
        institution: '',
        department: '',
        password: '',
        confirmPassword: '', 
        inviteCode: '',
    });
    
    // UI state
    const [showInviteCode, setShowInviteCode] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState(false);
    
    // Existing Supabase check
    const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    useEffect(() => {
        (async () => {
            try {
                const session = await getSession();
                if (session) router.replace('/home');
            } catch {}
        })();
    }, [router]);

    const handleGoogleSignUp = async () => {
        try {
            setIsOAuthLoading(true);
            await signInWithGoogle('/home');
        } catch (e) {
            console.error('Supabase Google sign-in failed', e);
            setErrors({ general: 'Google sign-in failed' });
        } finally {
            setIsOAuthLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
         if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const supabase = getSupabase();
            
            // Prepare metadata, filtering out undefined/empty values that might break triggers
            const metaData = {
                full_name: `${formData.title} ${formData.name}`,
                institution_name: formData.institution || null,
                department: formData.department || null,
                invite_code: showInviteCode && formData.inviteCode ? formData.inviteCode : null,
                title: formData.title || null
            };

            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: metaData,
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`
                }
            });

            if (error) {
                setErrors({ general: error.message });
            } else if (data.session || (data.user && !data.session)) {
                // Success - Show dialog instead of direct redirect
                setNeedsEmailConfirmation(true); // Always require confirmation flow
                setShowSuccessDialog(true);
            } else {
                setErrors({ general: 'Registration failed.' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-white text-slate-900">
            {/* Left Side - Testimonials */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

                <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Hexagon className="w-5 h-5 fill-indigo-500 text-white" />
                    </div>
                    Question Hive
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <div className="flex gap-1 text-amber-400">
                             {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                             ))}
                        </div>
                        <h2 className="text-3xl font-serif leading-tight">
                            "It used to take me weekends to draft JEE papers. With Question Hive, I curate high-quality assessments in minutes."
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Avatar removed as requested */}
                        <div>
                            <p className="font-bold text-white">Dr. Rajesh Kumar</p>
                            <p className="text-sm text-slate-400">Senior Physics Faculty, Allen Institute</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Trusted by 500+ Institutions</p>
                    <div className="flex gap-6 opacity-50 grayscale">
                        <div className="h-8 w-20 bg-white/20 rounded"></div>
                        <div className="h-8 w-20 bg-white/20 rounded"></div>
                        <div className="h-8 w-20 bg-white/20 rounded"></div>
                        <div className="h-8 w-20 bg-white/20 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-7/12 h-full overflow-y-auto" data-lenis-prevent>
                <div className="w-full min-h-full flex flex-col justify-center items-center py-12 lg:py-20 px-6">
                    <div className="max-w-md w-full">
                        
                        <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-indigo-600 mb-8">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                                 <Hexagon className="w-5 h-5 fill-indigo-600 text-white" />
                            </div>
                            Question Hive
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your faculty account</h1>
                            <p className="text-slate-500">Join the network of academic professionals.</p>
                        </div>

                         {errors.general && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {errors.general}
                            </div>
                        )}

                        {!hasSupabaseEnv && (
                             <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                                Supabase keys missing in .env.local
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                            <button 
                                type="button"
                                onClick={handleGoogleSignUp}
                                disabled={isOAuthLoading || !hasSupabaseEnv}
                                className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl p-2.5 hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700 disabled:opacity-50"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                {isOAuthLoading ? '...' : 'Google'}
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl p-2.5 hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700 opacity-60 cursor-not-allowed">
                                <img src="https://www.svgrepo.com/show/452062/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
                                Microsoft
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl p-2.5 hover:bg-emerald-50 hover:border-emerald-200 transition-colors font-medium text-sm text-slate-700 group opacity-60 cursor-not-allowed">
                                <span className="w-5 h-5 rounded-full bg-[#A6CE39] text-white flex items-center justify-center text-[10px] font-bold">iD</span>
                                ORCID
                            </button>
                        </div>

                        <div className="relative flex py-2 items-center mb-8">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">Or register with email</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
                            <div className="flex rounded-xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-600 transition-all">
                                <select 
                                    className="bg-slate-50 border-r border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100"
                                    value={formData.title}
                                    onChange={(e) => handleSelectChange('title', e.target.value)}
                                >
                                    <option>Prof.</option>
                                    <option>Dr.</option>
                                    <option>Mr.</option>
                                    <option>Ms.</option>
                                </select>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Sanjay Rao" 
                                    className="w-full px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Institutional Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@university.edu" 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                            />
                            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Use your .edu or .ac.in email for faster verification.
                            </p>
                        </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="institution">Institution</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleChange}
                                        placeholder="Enter Name or Select"
                                        list="institutions-list"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                                    />
                                    <datalist id="institutions-list">
                                        <option value="Indian Institute of Technology, Madras" />
                                        <option value="Indian Institute of Technology, Bombay" />
                                        <option value="Indian Institute of Technology, Delhi" />
                                        <option value="Anna University, Chennai" />
                                        <option value="Delhi University" />
                                        <option value="Vellore Institute of Technology" />
                                        <option value="National Institute of Technology, Trichy" />
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="department">Department</label>
                                <select 
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="" disabled>Select Subject</option>
                                    <option>Physics</option>
                                    <option>Chemistry</option>
                                    <option>Mathematics</option>
                                    <option>Biology</option>
                                    <option>Computer Science</option>
                                    <option>Other</option>
                                </select>
                            </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password" 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                            />
                            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                        </div>

                         <div className="pt-2">
                             <button
                                type="button"
                                onClick={() => setShowInviteCode(!showInviteCode)}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                             >
                                <svg className={`w-4 h-4 transition-transform ${showInviteCode ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                Joining an existing department?
                             </button>
                             
                             {showInviteCode && (
                                 <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                     <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="inviteCode">Invite Code</label>
                                     <input 
                                         type="text" 
                                         name="inviteCode"
                                         value={formData.inviteCode}
                                         onChange={handleChange}
                                         placeholder="Enter the code shared by your HOD" 
                                         className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                                     />
                                 </div>
                             )}
                         </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="text-xs text-slate-500 text-center leading-relaxed">
                            By creating an account, you agree to our <Link href="/terms" className="text-slate-700 underline">Terms of Service</Link> & <Link href="/privacy" className="text-slate-700 underline">Privacy Policy</Link>.
                            <br />
                            <span className="flex items-center justify-center gap-1 mt-2 text-slate-400">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Your exam data is end-to-end encrypted.
                            </span>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-600">
                        Already have an account? <Link href="/auth/login" className="font-bold text-indigo-600 hover:underline">Sign in</Link>
                    </div>
                </div>
            </div>
            </div>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Account Created Successfully!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                           Welcome to Question Hive, {formData.title} {formData.name}. Your faculty account has been registered.
                           <br/><br/>
                           Please check your email to confirm your identity before logging in.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button 
                            className="w-full sm:w-auto min-w-[140px]" 
                            onClick={() => router.push('/auth/login')}
                        >
                            Sign In
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}