'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AppLoader from '../../components/ui/AppLoader';

export default function ExamsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to SelectModules which will auto-select NEET
        router.push('/question-papers/select');
    }, [router]);

    return (
        <DashboardLayout>
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <AppLoader text="Loading NEET Exams..." />
            </div>
        </DashboardLayout>
    );
}