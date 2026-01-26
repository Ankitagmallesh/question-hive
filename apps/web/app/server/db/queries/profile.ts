import { db, users, profiles } from '@repo/db';
import { eq } from 'drizzle-orm';
import { cachedDbQuery } from '../../../lib/cache';

/**
 * Fetch user profile by email with intelligent caching
 * - Includes lazy user creation if not found
 * - Cached per user email for 60 seconds
 * - Request deduplication prevents race conditions on creation
 * - Cache tag: `profile-${email}` - revalidate on profile updates
 */
export const getProfileByEmail = async (email: string) => {
  return cachedDbQuery(
    async () => {
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || user.length === 0) {
        // User not found in DB, create them now (Lazy Creation)
        // This ensures every authenticated user has a DB record with default credits (150)
        const newUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
        const name = email.split('@')[0] || 'New User';

        try {
          // Use a collision-resistant ID (better: use UUID or DB sequence)
          // For now, add a retry loop to handle rare collisions
          let retries = 3;
          let created = false;
          while (retries > 0 && !created) {
            try {
              await db.insert(users).values({
                id: newUserId + (3 - retries), // Increment ID on collision
                email: email,
                name: name,
                passwordHash: 'supabase_auth',
                userRoleId: 1, // Default User Role
                isActive: true
              });
              created = true;
            } catch (err) {
              retries--;
              if (retries === 0) throw err;
            }
          }

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
    ['profile', email], // Cache key with email
    {
      revalidate: 60, // Short revalidation for user data
      tags: [`profile-${email}`, 'profiles'],
    }
  );
};
