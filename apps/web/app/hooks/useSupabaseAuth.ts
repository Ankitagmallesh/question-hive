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
          if (mounted) {
            // Map Supabase user to our shared User type as best-effort
            const mapped: User = {
              id: u?.id || '',
              name: u?.user_metadata?.full_name || u?.email || 'User',
              email: u?.email || '',
              avatarUrl: u?.user_metadata?.avatar_url || undefined,
              role: 'user',
            };
            setUser(mapped);
          }
        }
      } catch (error: unknown) {
        // Suppress "Failed to fetch" network errors to avoid full-screen overlay in dev
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             console.warn('Supabase Connection Error: Failed to fetch. Check your internet connection or SUPABASE_URL.');
             if (mounted) setLoading(false);
             return;
        }

        console.error('Auth Check Error:', error);
        // Handle "User from sub claim in JWT does not exist" or other auth errors
        const err = error as { message?: string; code?: string; status?: number };
        if (err.message?.includes('User from sub claim in JWT does not exist') ||
            err.code === 'user_not_found' ||
            err.status === 403) {
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
