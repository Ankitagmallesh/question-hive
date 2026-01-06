'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";
import { getSupabase } from "../../lib/supabase-client";
import { signInWithGoogle, getSession } from "../../lib/google-auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { GraduationCap } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        institutionId: undefined as number | undefined,
        termsAccepted: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState(false);
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
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (name === 'institution') {
            setFormData(prev => ({
                ...prev,
                institutionId: value === 'demo' ? 1 : undefined
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }

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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.termsAccepted) {
            newErrors.terms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const registerData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                institutionId: formData.institutionId
            };

            const supabase = getSupabase();
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        institution_id: formData.institutionId
                    }
                }
            });

            if (error) {
                setErrors({ general: error.message });
            } else if (data.session) {
                // Registration successful
                localStorage.setItem('auth_token', data.session.access_token);
                apiClient.setAuthToken(data.session.access_token);
                router.push('/home');
            } else if (data.user && !data.session) {
                setErrors({ general: 'Registration successful! Please check your email to confirm your account.' });
            } else {
                setErrors({ general: 'Registration failed. Please try again.' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Question Hive</span>
                    </Link>
                </div>

                <Card className="shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
                        <CardDescription className="text-center">
                            Start your academic journey today
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errors.general && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {errors.general}
                            </div>
                        )}

                        {/* Google OAuth Button */}
                        <div className="space-y-4">
                            {!hasSupabaseEnv && (
                                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded text-sm">
                                    Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local, then restart.
                                </div>
                            )}
                            <Button onClick={handleGoogleSignUp} variant="outline" className="w-full" disabled={isOAuthLoading || !hasSupabaseEnv}>
                                {isOAuthLoading ? 'Redirecting…' : 'Sign up with Google'}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full"
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution</Label>
                                <select
                                    id="institution"
                                    name="institution"
                                    onChange={handleChange}
                                    className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select your institution</option>
                                    <option value="demo">Demo College</option>
                                    <option value="other">Other (Please contact us)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    className="w-full"
                                />
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full"
                                />
                                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    id="terms"
                                    name="termsAccepted"
                                    type="checkbox"
                                    required
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <Label htmlFor="terms" className="text-sm">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                                        Privacy Policy
                                    </Link>
                                </Label>
                            </div>
                            {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}