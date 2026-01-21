// Supabase-based Google OAuth helper replacing direct backend flow.
// Uses supabase-js to initiate Google sign-in and relies on
// Supabase session storage (can read from cookies/local storage).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
    if (cached) return cached;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!/^https?:\/\//i.test(url)) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL must start with https://');
    }
    cached = createClient(url, anon);
    return cached;
}

export async function signInWithGoogle(redirectTo: string = '/home') {
    const supabase = getSupabase();
    // Redirect to our callback route to exchange code for cookie
    // The 'next' param tells the callback where to send the user eventually
    const redirectUrl = new URL('/auth/callback', window.location.origin);
    redirectUrl.searchParams.set('next', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
            redirectTo: redirectUrl.toString(),
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        }
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
}

export async function getSession() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function getUser() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}
