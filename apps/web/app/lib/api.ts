'use client';

import { createBrowserApiClient } from '@repo/api';
import { getSession } from './google-auth';

/**
 * Pre-configured API client for the browser
 * This client will automatically use the current origin as the base URL
 * and handle authentication tokens from localStorage
 */
export const apiClient = createBrowserApiClient('/api');

/**
 * Authentication helper functions
 */
export const auth = {
    /**
     * Set the authentication token for all API requests
     */
    setToken: (token: string) => {
        apiClient.setAuthToken(token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    },

    /**
     * Remove the authentication token
     */
    removeToken: () => {
        apiClient.removeAuthToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
        }
    },

    /**
     * Initialize authentication from localStorage
     */
    init: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                apiClient.setAuthToken(token);
            }
        }
    },

    /**
     * Get the current token from localStorage
     */
    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    },
};

// Initialize auth on import (browser only)
if (typeof window !== 'undefined') {
    auth.init();
    // Attempt to set Supabase access token if present
    (async () => {
        try {
            const session = await getSession();
            if (session?.access_token) {
                apiClient.setAuthToken(session.access_token);
            }
        } catch (e) {
            // ignore if Supabase not configured yet
        }
    })();
}
