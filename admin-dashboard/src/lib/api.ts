import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Get admin token from localStorage
export const getAdminToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('admin_token');
    }
    return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getAdminToken();
};

// Set admin token (call this after Firebase auth)
export const setAdminToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', token);
    }
};

// Clear admin token (logout)
export const clearAdminToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
    }
};

api.interceptors.request.use((config) => {
    const token = getAdminToken();

    // P0-01 FIX: No backdoor fallback. Require real token.
    if (!token) {
        // Don't add Authorization header - request will fail with 401
        // UI should handle the error and redirect to login
        console.warn('[API] No auth token available. Request may fail with 401.');
    } else {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAdminToken();
            // Optionally redirect to login
            if (typeof window !== 'undefined') {
                console.error('[API] 401 Unauthorized - Token invalid or missing');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
