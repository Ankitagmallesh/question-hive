'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";

export default function NotificationSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        questionUpdates: true,
        paperGeneration: true,
        systemUpdates: false,
        weeklyDigest: true,
        marketingEmails: false
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

    const handleToggle = (setting) => {
        setSettings({
            ...settings,
            [setting]: !settings[setting]
        });
    };

    const handleSave = async () => {
        setSaving(true);
        // TODO: Implement notification settings API call
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

    const NotificationToggle = ({ id, label, description, checked, onChange }: {
        id: string;
        label: string;
        description: string;
        checked: boolean;
        onChange: () => void;
    }) => (
        <div className="flex items-start justify-between py-4 border-b border-gray-200 last:border-b-0">
            <div className="flex-1">
                <Label htmlFor={id} className="text-base font-medium text-gray-900 cursor-pointer">
                    {label}
                </Label>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <div className="ml-4">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={onChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="mb-8">
                    <Button 
                        variant="default" 
                        onClick={() => router.push('/profile')}
                        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 shadow-md"
                    >
                        ← Back to Profile
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
                    <p className="text-gray-600 mt-2">Manage how and when you receive notifications</p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NotificationToggle
                                id="emailNotifications"
                                label="Enable Email Notifications"
                                description="Receive notifications via email for important updates"
                                checked={settings.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NotificationToggle
                                id="questionUpdates"
                                label="Question Updates"
                                description="Get notified when questions are added or modified"
                                checked={settings.questionUpdates}
                                onChange={() => handleToggle('questionUpdates')}
                            />
                            <NotificationToggle
                                id="paperGeneration"
                                label="Paper Generation"
                                description="Notifications about question paper creation and completion"
                                checked={settings.paperGeneration}
                                onChange={() => handleToggle('paperGeneration')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System & Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NotificationToggle
                                id="systemUpdates"
                                label="System Updates"
                                description="Important system maintenance and feature updates"
                                checked={settings.systemUpdates}
                                onChange={() => handleToggle('systemUpdates')}
                            />
                            <NotificationToggle
                                id="weeklyDigest"
                                label="Weekly Digest"
                                description="Weekly summary of your activity and platform updates"
                                checked={settings.weeklyDigest}
                                onChange={() => handleToggle('weeklyDigest')}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Marketing & Promotions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NotificationToggle
                                id="marketingEmails"
                                label="Marketing Emails"
                                description="Receive emails about new features, tips, and promotions"
                                checked={settings.marketingEmails}
                                onChange={() => handleToggle('marketingEmails')}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
                        >
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => router.push('/profile')}
                            className="flex-1 border-2 border-gray-400 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-500"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}