import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Mocking auth for Phase 1 - in real app, this would come from a context/localStorage
export const getAdminToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('admin_token');
    }
    return null;
};

api.interceptors.request.use((config) => {
    let token = getAdminToken();

    // Dev fallback for local testing
    if (!token && typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        token = 'admin-demo-uid';
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
