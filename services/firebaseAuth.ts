/**
 * Firebase Authentication Service
 * Unified authentication using Firebase Auth
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { storeUser } from '@/api/apiUser';

// Configure Google Sign-in
// Using Web client ID from whatsaynews Firebase project
GoogleSignin.configure({
  webClientId: '92160441398-mueier229usc3firqpt6sed1b09c8io0.apps.googleusercontent.com', // From whatsaynews project
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  offlineAccess: true,
  iosClientId: '396092481898-s3r4cvs735fc3oo2097nipogoico5hsb.apps.googleusercontent.com', // Keep iOS client from old project for now
});

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
}

/**
 * Convert Firebase user to app user format
 */
function mapFirebaseUser(firebaseUser: FirebaseAuthTypes.User): FirebaseUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    emailVerified: firebaseUser.emailVerified,
  };
}

/**
 * Sign in with Google using Firebase Auth
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    // Get user's ID token from Google Sign-in
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();

    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase with Google credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;

    // Get ID token for backend
    const token = await firebaseUser.getIdToken();

    // Store user in Supabase (for backward compatibility)
    try {
      await storeUser(
        {
          data: {
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photo: firebaseUser.photoURL,
            },
            idToken: token,
          },
        },
        'via google'
      );
    } catch (error) {
      console.warn('Failed to store user in Supabase:', error);
      // Continue even if Supabase fails
    }

    return mapFirebaseUser(firebaseUser);
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

/**
 * Sign in with Phone Number (already using Firebase)
 */
export async function signInWithPhoneNumber(phoneNumber: string) {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error: any) {
    console.error('Phone Sign-in Error:', error);
    throw new Error(`Phone sign-in failed: ${error.message}`);
  }
}

/**
 * Confirm phone OTP
 */
export async function confirmPhoneOTP(
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  code: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await confirmation.confirm(code);
    const firebaseUser = userCredential.user;

    // Get ID token for backend
    const token = await firebaseUser.getIdToken();

    // Store user in Supabase (for backward compatibility)
    try {
      await storeUser(
        {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            phone: firebaseUser.phoneNumber,
          },
          idToken: token,
        },
        'via phone'
      );
    } catch (error) {
      console.warn('Failed to store user in Supabase:', error);
      // Continue even if Supabase fails
    }

    return mapFirebaseUser(firebaseUser);
  } catch (error: any) {
    console.error('OTP Confirmation Error:', error);
    throw new Error(`OTP confirmation failed: ${error.message}`);
  }
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): FirebaseUser | null {
  const user = auth().currentUser;
  return user ? mapFirebaseUser(user) : null;
}


/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await auth().signOut();
    await GoogleSignin.signOut();
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
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('No user signed in');

    await user.updateProfile(updates);
    await user.reload(); // Reload to get updated profile
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Update email
 */
export async function updateEmail(newEmail: string): Promise<void> {
  try {
    const user = auth().currentUser;
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
  try {
    const user = auth().currentUser;
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
  return auth().onAuthStateChanged((firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}

/**
 * Listen to ID token changes
 */
export function onIdTokenChanged(
  callback: (token: string | null) => void
): () => void {
  return auth().onIdTokenChanged(async (user) => {
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
