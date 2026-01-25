import { db, users, profiles } from '@repo/db';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getProfileByEmail = async (email: string) => {
  return unstable_cache(
    async () => {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user || user.length === 0) {
        return {
            user: { name: '', email: email },
            profile: {}
        };
      }

      const userId = user[0].id;
      const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

      return {
        user: {
            id: userId,
            name: user[0].name,
            email: user[0].email,
        },
        profile: profile[0] || {}
      };
    },
    [`profile-${email}`],
    {
      tags: [`profile-${email}`],
      revalidate: 3600, // 1 hour
    }
  )();
};
