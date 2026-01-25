'use server';

import { updateProfileMutation, UpdateProfileInput } from '../db/mutations/profile';
import { revalidateTag } from 'next/cache';

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const result = await updateProfileMutation(input);
    revalidateTag(`profile-${input.email}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Update Profile Action Error:', error);
    return { success: false, error: error.message };
  }
}
