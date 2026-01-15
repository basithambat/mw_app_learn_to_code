/**
 * Firebase Authentication Service
 * Unified authentication using Firebase Auth (Web & Native)
 */

import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


// Native Imports
import nativeAuth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Web Support Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential as webSignInWithCredential,
  onAuthStateChanged as webOnAuthStateChanged,
  onIdTokenChanged as webOnIdTokenChanged,
  signInWithPhoneNumber as webSignInWithPhoneNumber,
  signOut as webSignOut,
  updateProfile as webUpdateProfile,
  updateEmail as webUpdateEmail,
  sendEmailVerification as webSendEmailVerification,
  User as WebUser,
  Auth as WebAuth
} from 'firebase/auth';

// Web Configuration (whatsaynews)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize for Web
let webAuth: WebAuth | null = null;
if (Platform.OS === 'web') {
  try {
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }
    webAuth = getAuth();
    console.log("Firebase Web Initialized");
  } catch (e) {
    console.error("Firebase Web Init Error:", e);
  }
}

// Initialize Native Firebase (ensure it's ready)
let nativeFirebaseReady = false;
if (Platform.OS !== 'web') {
  try {
    // Test if Firebase is initialized by accessing the auth instance
    const testAuth = nativeAuth();
    nativeFirebaseReady = true;
    console.log("React Native Firebase initialized successfully");
  } catch (e) {
    console.warn("React Native Firebase not ready yet:", e);
    // Firebase will auto-initialize on first use
  }
}

// Configure Google Sign-in (Mobile Only)
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    offlineAccess: true,
  });
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string>;
}

// Map Native User
function mapNativeUser(firebaseUser: FirebaseAuthTypes.User): FirebaseUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    emailVerified: firebaseUser.emailVerified,
    getIdToken: () => firebaseUser.getIdToken(),
  };
}

// Map Web User
function mapWebUser(firebaseUser: WebUser): FirebaseUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    emailVerified: firebaseUser.emailVerified,
    getIdToken: () => firebaseUser.getIdToken(),
  };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (Platform.OS === 'web') {
    // Web: Use Popup
    try {
      if (!webAuth) throw new Error("Firebase Web Auth not initialized");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(webAuth, provider);
      const user = result.user;
      const token = await user.getIdToken();


      return mapWebUser(user);
    } catch (error: any) {
      console.error('Web Google Sign-in Error:', error);
      throw error;
    }
  } else {
    // Native: Use GoogleSignin + Credential
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error('No ID token found');
      const googleCredential = nativeAuth.GoogleAuthProvider.credential(idToken);
      const userCredential = await nativeAuth().signInWithCredential(googleCredential);
      const user = userCredential.user;
      const token = await user.getIdToken();


      return mapNativeUser(user);
    } catch (error: any) {
      console.error('Native Google Sign-in Error:', error);
      throw error;
    }
  }
}

/**
 * Sync user with backend
 */


/**
 * Sign in with Phone Number
 * Note: Web implementation for Phone Auth is complex and requires RecaptchaVerifier.
 * For now, we stub it or use a simple implementation if needed, but keeping primarily native logic here.
 */
export async function signInWithPhoneNumber(phoneNumber: string) {
  if (Platform.OS === 'web') {
    console.warn("Phone Auth on web requires ReCaptcha. Not fully implemented.");
    if (!webAuth) throw new Error("Web Auth not initialized");
    // Web requires a RecaptchaVerifier passed as 2nd arg. 
    // This is significant UI work. For this fix, we might want to skip or basic imp.
    // return webSignInWithPhoneNumber(webAuth, phoneNumber, ...); 
    throw new Error("Phone Sign-in not implemented for Web yet");
  }

  try {
    const confirmation = await nativeAuth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error: any) {
    console.error('Phone Sign-in Error:', error);
    throw new Error(`Phone sign-in failed: ${error.message}`);
  }
}

/**
 * Confirm phone OTP (Native Only for now)
 */
export async function confirmPhoneOTP(
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  code: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await confirmation.confirm(code);
    if (!userCredential) throw new Error('Confirmation failed');
    const user = userCredential.user;
    const token = await user.getIdToken();


    return mapNativeUser(user);
  } catch (error: any) {
    console.error('OTP Confirmation Error:', error);
    throw new Error(`OTP confirmation failed: ${error.message}`);
  }
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): FirebaseUser | null {
  if (Platform.OS === 'web') {
    return webAuth?.currentUser ? mapWebUser(webAuth.currentUser) : null;
  }

  try {
    const user = nativeAuth().currentUser;
    return user ? mapNativeUser(user) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (!webAuth) return;
      await webSignOut(webAuth);
    } else {
      await nativeAuth().signOut();
      await GoogleSignin.signOut();
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  if (Platform.OS === 'web') {
    const user = webAuth?.currentUser;
    if (!user) throw new Error('No user signed in');
    await webUpdateProfile(user, updates);
    await user.reload();
    return;
  }

  try {
    const user = nativeAuth().currentUser;
    if (!user) throw new Error('No user signed in');
    await user.updateProfile(updates);
    await user.reload();
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Update email
 */
export async function updateEmail(newEmail: string): Promise<void> {
  if (Platform.OS === 'web') {
    const user = webAuth?.currentUser;
    if (!user) throw new Error('No user signed in');
    await webUpdateEmail(user, newEmail);
    return;
  }

  try {
    const user = nativeAuth().currentUser;
    if (!user) throw new Error('No user signed in');
    await user.updateEmail(newEmail);
  } catch (error) {
    console.error('Update email error:', error);
    throw error;
  }
}

/**
 * Send email verification
 */
export async function sendEmailVerification(): Promise<void> {
  if (Platform.OS === 'web') {
    const user = webAuth?.currentUser;
    if (!user) throw new Error('No user signed in');
    await webSendEmailVerification(user);
    return;
  }

  try {
    const user = nativeAuth().currentUser;
    if (!user) throw new Error('No user signed in');
    await user.sendEmailVerification();
  } catch (error) {
    console.error('Send email verification error:', error);
    throw error;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (Platform.OS === 'web') {
    if (!webAuth) return () => { };
    return webOnAuthStateChanged(webAuth as WebAuth, (user) => {
      callback(user ? mapWebUser(user as WebUser) : null);
    });
  }

  try {
    return nativeAuth().onAuthStateChanged((firebaseUser) => {
      callback(firebaseUser ? mapNativeUser(firebaseUser) : null);
    });
  } catch (e) {
    console.error("onAuthStateChanged failed:", e);
    return () => { };
  }
}

/**
 * Listen to ID token changes
 */
export function onIdTokenChanged(
  callback: (token: string | null) => void
): () => void {
  if (Platform.OS === 'web') {
    if (!webAuth) return () => { };
    return webOnIdTokenChanged(webAuth as WebAuth, async (user) => {
      if (user) {
        try {
          const token = await (user as WebUser).getIdToken();
          callback(token);
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  return nativeAuth().onIdTokenChanged(async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        callback(token);
      } catch (error) {
        console.error('Error getting token:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get access to the native Auth instance (INTERNAL USE ONLY)
 * Use only if you know what you are doing and are on native
 */
export const getNativeAuth = () => {
  if (Platform.OS === 'web') return null;
  return nativeAuth();
}

/**
 * Refresh the ID token (force refresh)
 */
export async function getIdToken(forceRefresh: boolean = false): Promise<string | null> {
  if (Platform.OS === 'web') {
    const user = webAuth?.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  }

  try {
    const user = nativeAuth().currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  } catch (e) {
    console.error("getIdToken error:", e);
    return null;
  }
}
