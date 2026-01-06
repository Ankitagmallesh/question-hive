'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";
import { signInWithGoogle, getSession } from "../../lib/google-auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
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

    const handleGoogleSignIn = async () => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

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

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            const loginData = {
                email: formData.email,
                password: formData.password
            };

            const response = await apiClient.auth.login(loginData);

            if (response.success && response.data) {
                // Login successful
                localStorage.setItem('auth_token', response.data.token);
                apiClient.setAuthToken(response.data.token);

                // Store refresh token if provided
                if (response.data.refreshToken) {
                    localStorage.setItem('refresh_token', response.data.refreshToken);
                }

                router.push('/home');
            } else {
                setErrors({ general: response.error || 'Login failed. Please check your credentials.' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'Login failed. Please try again.' });
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
                        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errors.general && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {errors.general}
                            </div>
                        )}

                        {/* Google OAuth via Supabase */}
                        <div className="space-y-4">
                            {!hasSupabaseEnv && (
                                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded text-sm">
                                    Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local, then restart.
                                </div>
                            )}
                            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isOAuthLoading || !hasSupabaseEnv}>
                                {isOAuthLoading ? 'Redirecting…' : 'Continue with Google'}
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
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full"
                                />
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="remember-me"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <Label htmlFor="remember-me" className="text-sm">
                                        Remember me
                                    </Label>
                                </div>

                                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}