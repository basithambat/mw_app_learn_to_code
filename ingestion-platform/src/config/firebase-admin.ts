/**
 * Firebase Admin SDK Configuration
 * Used to verify Firebase ID tokens on the backend
 */

import admin from 'firebase-admin';
import { getEnv } from './env';

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized || admin.apps.length > 0) {
    return;
  }

  const env = getEnv();

  try {
    // Option 1: Use service account JSON file (if provided)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        // Ensure private key has correct newline formatting
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Ensure it is a valid single-line JSON string.');
        throw parseError;
      }
    }
    // Option 2: Use GOOGLE_APPLICATION_CREDENTIALS env var
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    // Option 3: Use environment variables directly
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    // Option 4: Try application default (for GCP environments)
    else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }

    initialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (error: any) {
    if (error.code === 'app/invalid-credential' || error.message?.includes('ASN.1')) {
      console.error('❌ Firebase Admin initialization failed: Invalid service account credential. Check your private key format.');
    } else {
      console.error('❌ Firebase Admin initialization failed:', error.message || error);
    }
    // Don't throw - allow app to continue without Firebase Admin
    // (useful for development or if Firebase is optional)
  }
}

/**
 * Verify Firebase ID token
 * Returns decoded token with user info
 */
export async function verifyFirebaseToken(idToken: string) {
  if (!initialized && admin.apps.length === 0) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Get user info from Firebase
 */
export async function getUserInfo(uid: string) {
  if (!initialized && admin.apps.length === 0) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const user = await admin.auth().getUser(uid);
    return user;
  } catch (error: any) {
    console.error('Get user info failed:', error.message);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}
