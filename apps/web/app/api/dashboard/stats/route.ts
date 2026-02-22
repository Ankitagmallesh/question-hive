import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users, eq } from '@repo/db';
import { getDashboardStats } from '../../../server/db/queries/dashboard-stats';
import { users, eq } from '@repo/db';
import { getDashboardStats } from '../../../server/db/queries/dashboard-stats';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const userRes = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        
        if (userRes.length === 0) {
            return NextResponse.json({ 
                success: true, 
                stats: {
                    totalQuestions: 0,
                    totalPapers: 0,
                    typeBreakdown: [],
                    difficultyBreakdown: []
                }, 
                recentPapers: [] 
            });
        }

        const userId = userRes[0]!.id;
        const data = await getDashboardStats(userId);

        return NextResponse.json({ success: true, ...data });
        return NextResponse.json({ success: true, ...data });

    } catch (error: any) {
        console.error('Fetch Dashboard Stats Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
