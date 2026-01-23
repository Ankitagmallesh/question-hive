import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { users, profiles, questionPapers, questions } from '@repo/db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user || user.length === 0) {
             // Return empty profile instead of 404 to avoid frontend errors
             // This happens when user exists in Auth but not yet in Local DB
             return NextResponse.json({ 
                success: true, 
                user: { name: '', email: email }, 
                profile: {} 
            });
        }
        
        const userId = user[0].id;
        
        // Fetch profile
        const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

        return NextResponse.json({ 
            success: true, 
            user: {
                id: userId, // Include local DB ID
                name: user[0].name,
                email: user[0].email,
            },
            profile: profile[0] || {}
        });

    } catch (error: any) {
        console.error('Get Profile Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, bio, phone, address, avatarUrl } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
        }

        let userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
        let userId: number;

        if (userResult.length === 0) {
             // Create User using info from request ( synced from Supabase via Frontend)
             const newUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
             
             // Use default role ID 1 (System Admin / User) - Adjust as needed
             // Use default institution ID or null
             await db.insert(users).values({
                 id: newUserId,
                 email: email,
                 name: name || 'New User',
                 passwordHash: 'supabase_auth', // Placeholder
                 userRoleId: 1, 
                 isActive: true
             });
             userId = newUserId;
        } else {
            userId = userResult[0].id;
            // Update user name if changed
            if (name && name !== userResult[0].name) {
                await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId));
            }
        }

        // Check if profile exists
        const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

        if (existingProfile.length > 0) {
            // Update
            await db.update(profiles).set({
                bio,
                phone,
                address,
                avatarUrl,
                updatedAt: new Date()
            }).where(eq(profiles.userId, userId));
        } else {
            // Create
            await db.insert(profiles).values({
                id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000),
                userId,
                bio,
                phone,
                address,
                avatarUrl
            });
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });

    } catch (error: any) {
         console.error('Update Profile Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
