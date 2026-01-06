'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api';
import type { User } from '@repo/types';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

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
                    // Check if there's updated profile data in localStorage
                    const savedProfile = localStorage.getItem('user_profile');
                    if (savedProfile) {
                        const parsedProfile = JSON.parse(savedProfile);
                        setUser({ ...response.data, ...parsedProfile });
                    } else {
                        setUser(response.data);
                    }
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

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // TODO: Replace with actual API call when backend endpoint is ready
            // await apiClient.auth.deleteAccount();
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Clear all local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_profile');
            apiClient.removeAuthToken();
            
            // Redirect to landing page
            router.push('/');
        } catch (error) {
            console.error('Failed to delete account:', error);
            setIsDeleting(false);
        }
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
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <Button 
                        variant="default" 
                        onClick={() => router.back()}
                        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 shadow-md"
                    >
                        ← Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-2">View and manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Your account details and information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Name:</span>
                                    <span className="text-sm font-semibold text-gray-900">{user?.name || user?.email?.split('@')[0] || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Email:</span>
                                    <span className="text-sm font-semibold text-gray-900">{user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Role:</span>
                                    <Badge variant="secondary">{user?.role || 'User'}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Status:</span>
                                    <Badge variant={user?.isActive ? "default" : "destructive"}>
                                        {user?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                {user?.lastLoginAt && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Last Login:</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {new Date(user.lastLoginAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {user?.institution && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Institution:</span>
                                        <span className="text-sm font-semibold text-gray-900">{user.institution.name}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => router.push('/profile/edit')}
                            >
                                Edit Profile
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => router.push('/profile/password')}
                            >
                                Change Password
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => router.push('/profile/notifications')}
                            >
                                Notification Settings
                            </Button>
                            <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Account Confirmation Dialog */}
                {showDeleteDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader className="text-center">
                                <CardTitle className="text-red-600 text-xl">Delete Account</CardTitle>
                                <CardDescription className="text-center mt-2">
                                    This action cannot be undone. This will permanently delete your account and remove all your data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="deleteConfirm" className="text-sm font-medium text-gray-700">
                                        Please type <span className="font-bold text-red-600">delete</span> to confirm:
                                    </Label>
                                    <Input
                                        id="deleteConfirm"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder="Type 'delete' to confirm"
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowDeleteDialog(false);
                                            setDeleteConfirmation('');
                                        }}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmation !== 'delete'}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}