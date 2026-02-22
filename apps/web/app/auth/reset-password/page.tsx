'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase-client";
import { Hexagon, CheckCircle2, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.password) {
            setError('Password is required');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.updateUser({
                password: formData.password
            });
            
            if (error) {
                setError(error.message);
            } else {
                setShowSuccessDialog(true);
            }
        } catch (err) {
            console.error('Update password error:', err);
            setError('An unexpected error occurred. Please try again.');
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
                     <h2 className="text-3xl font-serif leading-tight">
                        "Secure your account with a strong password."
                    </h2>
                </div>

                <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Security First</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-7/12 h-full overflow-y-auto bg-white" data-lenis-prevent>
                <div className="w-full min-h-full flex flex-col justify-center items-center py-12 lg:py-20 px-6">
                    <div className="max-w-md w-full">
                    
                        <div className="lg:hidden flex items-center gap-2 font-bold text-xl text-indigo-600 mb-8">
                            <img src="/logo-new.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                            Question Hive
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h1>
                            <p className="text-slate-500">Please enter and confirm your new password.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">New Password</label>
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password" 
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password" 
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                                {!isLoading && <Lock className="w-4 h-4" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Password Updated!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                           Your password has been successfully changed. You can now log in with your new password.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button 
                            className="w-full sm:w-auto min-w-[140px]" 
                            onClick={() => router.push('/auth/login')}
                        >
                            Back to Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
