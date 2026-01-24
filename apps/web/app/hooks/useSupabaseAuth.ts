'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getUser, signOut } from '../lib/google-auth';
import type { User } from '@repo/types';

type AuthState = {
  user: User | null;
  loading: boolean;
};

export function useSupabaseAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await getSession();
        if (!session) {
          if (mounted) setUser(null);
        } else {
          const u = await getUser();
          if (mounted && u?.email) {
             // Fetch local profile to get the numeric ID
             let localId = 0;
             let role = 'user';
             let credits = 0;
             
             try {
                const res = await fetch(`/api/profile?email=${u.email}`);
                const data = await res.json();
                if (data.success && data.user?.id) {
                    localId = data.user.id;
                    credits = data.user.credits || 0;
                    // Could also map role here if returned
                }
             } catch (err) {
                 console.error('Failed to fetch local profile:', err);
             }

            // Map Supabase user to our shared User type
            const mapped: User = {
              id: localId, // Using local numeric ID
              id: localId, // Using local numeric ID
              name: u?.user_metadata?.full_name || u?.email || 'User',
              email: u?.email || '',
              credits: credits,
              avatarUrl: u?.user_metadata?.avatar_url || undefined,
              role: role as any,
            } as any;
            setUser(mapped);
          }
        }
      } catch (error: unknown) {
      } catch (error: unknown) {
        // Suppress "Failed to fetch" network errors to avoid full-screen overlay in dev
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             console.warn('Supabase Connection Error: Failed to fetch. Check your internet connection or SUPABASE_URL.');
             if (mounted) setLoading(false);
             return;
        }

        console.error('Auth Check Error:', error);
        // Handle "User from sub claim in JWT does not exist" or other auth errors
        if (error?.message?.includes('User from sub claim in JWT does not exist') ||
            error?.code === 'user_not_found' ||
            error?.status === 403) {
           // Clear local state
           if (typeof window !== 'undefined') {
               localStorage.removeItem('auth_token');
               localStorage.removeItem('refresh_token');
               // also try to sign out from supabase to clear cookies
               await signOut().catch(() => {});
           }
           if (mounted) {
               setUser(null);
               router.push('/auth/register');
           }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}
