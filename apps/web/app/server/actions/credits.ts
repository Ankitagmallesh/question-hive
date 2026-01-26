'use server'

import { createClient } from '@/utils/supabase/server';
import { db } from '@/lib/db';
import { users } from '@repo/db';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function purchaseCredits() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error('Unauthorized');
  }

  // Update user credits
  await db.update(users)
    .set({ credits: sql`${users.credits} + 100` })
    .where(eq(users.email, user.email));

  revalidatePath('/home');
  return { success: true, message: '100 Credits added successfully' };
}
