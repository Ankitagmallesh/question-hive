'use server';

import { updateProfileMutation, UpdateProfileInput } from '../db/mutations/profile';
import { clearUserCaches } from '../../lib/cache';

/**
 * Update user profile and invalidate all related caches
 * This ensures next request gets fresh data without stale cache
 */
export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const result = await updateProfileMutation(input);
    // Clear all caches related to this user
    clearUserCaches(input.email);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Update Profile Action Error:', error);
    return { success: false, error: error.message };
  }
}
