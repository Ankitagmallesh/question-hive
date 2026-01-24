'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            apiClient.setAuthToken(token);

            try {
                const response = await apiClient.auth.getProfile();
                if (!response.success) {
                    router.push('/auth/login');
                }
            } catch (error) {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        // TODO: Implement password change API call
        setTimeout(() => {
            setSaving(false);
            router.push('/profile');
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-8">
                    <Button 
                        variant="default" 
                        onClick={() => router.push('/profile')}
                        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 shadow-md"
                    >
                        ← Back to Profile
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
                    <p className="text-gray-600 mt-2">Update your account password for better security</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Password Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input 
                                id="currentPassword" 
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword} 
                                onChange={handleChange}
                                placeholder="Enter your current password"
                            />
                            {errors.currentPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                                id="newPassword" 
                                name="newPassword"
                                type="password"
                                value={formData.newPassword} 
                                onChange={handleChange}
                                placeholder="Enter your new password"
                            />
                            {errors.newPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input 
                                id="confirmPassword" 
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword} 
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• At least 6 characters long</li>
                                <li>• Mix of uppercase and lowercase letters recommended</li>
                                <li>• Include numbers and special characters for better security</li>
                            </ul>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? 'Updating...' : 'Update Password'}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/profile')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}