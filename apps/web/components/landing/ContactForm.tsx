"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsSubmitted(true);
            } else {
                setError(result.message || "Oops! There was a problem submitting your form");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-white rounded-[24px] p-8 shadow-2xl shadow-slate-200 border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                    Thank you for reaching out. Our team will review your message and reach out to you shortly.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] p-8 shadow-2xl shadow-slate-200 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input 
                        type="text" 
                        id="name"
                        name="name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="John Doe"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="+91 98765 43210"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="john@school.edu"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="institute" className="text-sm font-semibold text-slate-700">Institute Name</label>
                    <input 
                        type="text" 
                        id="institute"
                        name="institute"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                        placeholder="St. Xavier's High School"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Send Message"
                    )}
                </button>
            </form>
        </div>
    );
}
