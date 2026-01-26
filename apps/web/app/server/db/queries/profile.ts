import { db, users, profiles } from '@repo/db';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getProfileByEmail = async (email: string) => {
  return unstable_cache(
    async () => {
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || user.length === 0) {
        // User not found in DB, create them now (Lazy Creation)
        // This ensures every authenticated user has a DB record with default credits (150)
        const newUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
        const name = email.split('@')[0] || 'New User';

        try {
            await db.insert(users).values({
                id: newUserId,
                email: email,
                name: name,
                passwordHash: 'supabase_auth',
                userRoleId: 1, // Default User Role
                isActive: true
            });

            // Re-fetch the user to ensure we have the DB record (including default credits)
            user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        } catch (error) {
            console.error('Failed to auto-create user in getProfileByEmail:', error);
            // Fallback to empty if creation failed (e.g. race condition)
             return {
                user: { name: '', email: email },
                profile: {}
            };
        }
      }

      if (!user || user.length === 0) {
        return {
            user: { name: '', email: email },
            profile: {}
        };
      }

      const userId = user[0]!.id;
      const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

      return {
        user: {
            id: userId,
            name: user[0]!.name,
            email: user[0]!.email,
            credits: user[0]!.credits,
        },
        profile: profile[0] || {}
      };
    },
    [`profile-${email}-v2`], // Updated cache key
    {
      tags: [`profile-${email}`],
      revalidate: 60, // Reduced revalidate time
    }
  )();
};
