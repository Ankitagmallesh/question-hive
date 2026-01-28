import { db, users, profiles } from '@repo/db';
import { eq } from 'drizzle-orm';

export interface UpdateProfileInput {
  email: string;
  name?: string;
  bio?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export const updateProfileMutation = async (input: UpdateProfileInput) => {
  const { email, name, bio, phone, address, avatarUrl } = input;

  let userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
  let userId: number;

  if (userResult.length === 0) {
      // Create User
      const newUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      
      await db.insert(users).values({
          id: newUserId,
          email: email,
          name: name || 'New User',
          passwordHash: 'supabase_auth',
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

  return { success: true, userId };
};
