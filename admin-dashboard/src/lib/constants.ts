// Production URL for GCP Cloud Run deployment
// Should use Env Var to prevent hardcoding issues
const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://whatsay-api-jsewdobsva-el.a.run.app/api';
const LOCAL_API_URL = 'http://localhost:3002/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? PRODUCTION_API_URL
        : LOCAL_API_URL);
