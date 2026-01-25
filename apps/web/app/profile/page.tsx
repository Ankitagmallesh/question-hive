"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { Loader2, Save, User as UserIcon, Mail, Phone, MapPin, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user: authUser, loading: authLoading } = useSupabaseAuth();
    const [profile, setProfile] = useState({
        bio: '',
        phone: '',
        address: '',
        avatarUrl: ''
    });
    const [dbUser, setDbUser] = useState({ name: '', email: '' });
    const [stats, setStats] = useState({ papers: 0, questions: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && authUser?.email) {
            fetchProfile(authUser.email);
        } else if (!authLoading && !authUser) {
             setLoading(false); // No user logged in
        }
    }, [authLoading, authUser]);

    const fetchProfile = async (email: string) => {
        try {
            const res = await fetch(`/api/profile?email=${email}`);
            const data = await res.json();
            if (data.success) {
                setDbUser({
                    name: data.user.name || authUser?.name || '',
                    email: data.user.email
                });
                setProfile(prev => ({ ...prev, ...data.profile }));
                if (data.stats) {
                    setStats(data.stats);
                }
            } else {
                console.error("Failed to fetch profile:", data.error);
                // Maybe user doesn't exist in DB yet but is in Auth?
                setDbUser({ name: authUser?.name || '', email: email });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: dbUser.email,
                    name: dbUser.name, 
                    ...profile
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully");
            } else {
                toast.error("Failed to update profile: " + data.error);
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-2">Manage your personal information and preferences.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 border-4 border-white shadow-lg overflow-hidden">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold">{dbUser.name ? dbUser.name.charAt(0).toUpperCase() : 'U'}</span>
                                    )}
                                </div>
                                <label className="absolute bottom-4 right-0 p-1.5 bg-white rounded-full shadow-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors text-slate-600">
                                    <Pencil size={14} />
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) { 
                                                    toast.error("Image size should be less than 2MB");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{dbUser.name}</h2>
                            <p className="text-sm text-slate-500">{dbUser.email}</p>
                            
                            <div className="mt-4 w-full pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">{stats.papers}</p>
                                    <p className="text-xs text-slate-500">Papers</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">{stats.questions}</p>
                                    <p className="text-xs text-slate-500">Questions</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Plan Credits</p>
                                <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                    <span>Used</span>
                                    <span>450 / 1000</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-[45%]"></div>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Personal Details</h3>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                            <UserIcon size={16} className="text-slate-400" /> Full Name
                                        </label>
                                        <input 
                                            id="fullName"
                                            type="text" 
                                            value={dbUser.name} 
                                            onChange={(e) => setDbUser(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                            <Mail size={16} className="text-slate-400" /> Email
                                        </label>
                                        <input 
                                            id="email"
                                            type="email" 
                                            value={dbUser.email} 
                                            disabled 
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400" /> Bio
                                    </label>
                                    <textarea 
                                        id="bio"
                                        rows={4}
                                        value={profile.bio || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                            <Phone size={16} className="text-slate-400" /> Phone
                                        </label>
                                        <input 
                                            id="phone"
                                            type="tel"
                                            value={profile.phone || ''}
                                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-400" /> Address
                                        </label>
                                        <input 
                                            id="address"
                                            type="text"
                                            value={profile.address || ''}
                                            onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}