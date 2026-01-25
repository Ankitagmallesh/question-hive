'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import type { User } from '@repo/types';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import ProfileMenu from '../../../components/ProfileMenu';

export default function EditProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: ''
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
                if (response.success && response.data) {
                    setUser(response.data);
                    setFormData({
                        name: response.data.name || '',
                        email: response.data.email || '',
                        role: response.data.role || ''
                    });
                } else {
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
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Replace with actual API call when backend endpoint is ready
            // const response = await apiClient.auth.updateProfile(formData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For now, update localStorage with the new data
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user_profile', JSON.stringify(updatedUser));
            
            // Redirect back to profile
            router.push('/profile');
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        apiClient.removeAuthToken();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <AppLoader text="Loading your profile..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header - Same as home */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 sm:py-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">QH</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Question Hive</h1>
                        </div>
                        <ProfileMenu user={user} onLogout={handleLogout} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Button 
                        variant="default" 
                        onClick={() => router.push('/profile')}
                        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 shadow-md"
                    >
                        ← Back to Profile
                    </Button>
                    <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
                    <p className="mt-2 text-gray-600">Update your personal information and preferences</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name" 
                                    name="name"
                                    value={formData.name} 
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                    id="email" 
                                    name="email"
                                    type="email"
                                    value={formData.email} 
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Input 
                                id="role" 
                                name="role"
                                value={formData.role} 
                                disabled
                                className="mt-1 bg-gray-100"
                            />
                            <p className="text-sm text-gray-500 mt-1">Role cannot be changed. Contact administrator if needed.</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/home')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}