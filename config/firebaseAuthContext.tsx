/**
 * Firebase Authentication Context
 * Provides Firebase auth state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseUser, onAuthStateChanged, getIdToken, signOut as firebaseSignOut } from '@/services/firebaseAuth';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/redux/slice/userSlice';
import { verifyAuth } from '@/api/apiAuth';
import type { Persona } from '@/api/apiAuth';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  token: string | null;
  loading: boolean;
  personas: Persona[];
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  syncWithBackend: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider = ({ children }: FirebaseAuthProviderProps) => {
  const [user, setUserState] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUserState(firebaseUser);

      if (firebaseUser) {
        // Get ID token
        const idToken = await getIdToken();
        setToken(idToken);

        // Sync with backend to get personas
        try {
          const authData = await verifyAuth();
          setPersonas(authData.personas);

          // Update Redux store with backend user data
          dispatch(setUser({
            user: {
              id: authData.user.id,
              email: authData.user.email || '',
              name: firebaseUser.displayName || '',
              pic: firebaseUser.photoURL || '',
              phone: authData.user.phone || '',
            },
            token: idToken || '',
          }));

          // Store personas in AsyncStorage
          await AsyncStorage.setItem('personas', JSON.stringify(authData.personas));
        } catch (error) {
          console.warn('Failed to sync with backend:', error);
          // Fallback to Firebase user data only
          dispatch(setUser({
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              pic: firebaseUser.photoURL || '',
              phone: firebaseUser.phoneNumber || '',
            },
            token: idToken || '',
          }));
        }

        // Store in AsyncStorage for persistence
        await AsyncStorage.setItem('firebase_user', JSON.stringify(firebaseUser));
        if (idToken) {
          await AsyncStorage.setItem('firebase_token', idToken);
        }
      } else {
        setToken(null);
        setPersonas([]);
        dispatch(clearUser());
        await AsyncStorage.removeItem('firebase_user');
        await AsyncStorage.removeItem('firebase_token');
        await AsyncStorage.removeItem('personas');
      }

      setLoading(false);
    });

    // Check for stored user on mount
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('firebase_user');
        const storedToken = await AsyncStorage.getItem('firebase_token');
        const storedPersonas = await AsyncStorage.getItem('personas');

        if (storedUser && storedToken) {
          // User will be set by onAuthStateChanged, but we can set token immediately
          setToken(storedToken);
          if (storedPersonas) {
            try {
              setPersonas(JSON.parse(storedPersonas));
            } catch (e) {
              console.warn('Failed to parse stored personas:', e);
            }
          }
        } else if (__DEV__) {
          // STAFF DEV BYPASS: Automatically inject a test identity for instant reaction testing
          const mockUser = {
            uid: 'dev-staff-123',
            email: 'dev@whatsay.app',
            displayName: 'Basith (Staff)',
            photoURL: 'https://placehold.co/100x100?text=B',
            phoneNumber: '+1234567890'
          };
          const mockPersonas: Persona[] = [
            {
              id: 'p1',
              displayName: 'Basith (Staff)',
              type: 'verified',
              avatarUrl: 'https://placehold.co/100x100?text=B',
              badge: 'google_verified',
              isDefault: true
            },
            {
              id: 'p2',
              displayName: 'Anonymous Agent',
              type: 'anonymous',
              avatarUrl: null,
              badge: null,
              isDefault: false
            }
          ];

          setUserState(mockUser as any);
          setToken('mock-dev-token');
          setPersonas(mockPersonas);

          dispatch(setUser({
            user: {
              id: mockUser.uid,
              email: mockUser.email,
              name: mockUser.displayName,
              pic: mockUser.photoURL,
              phone: mockUser.phoneNumber,
            },
            token: 'mock-dev-token',
          }));
          console.log('🔑 Dev Bypass: Logged in as Basith (Staff)');
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStoredUser();

    return unsubscribe;
  }, [dispatch]);

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setUserState(null);
      setToken(null);
      setPersonas([]);
      dispatch(clearUser());
      await AsyncStorage.removeItem('firebase_user');
      await AsyncStorage.removeItem('firebase_token');
      await AsyncStorage.removeItem('personas');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const newToken = await getIdToken(true); // Force refresh
      if (newToken) {
        setToken(newToken);
        await AsyncStorage.setItem('firebase_token', newToken);
      }
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  };

  const syncWithBackend = async (): Promise<void> => {
    if (!user) return;
    try {
      const authData = await verifyAuth();
      setPersonas(authData.personas);
      await AsyncStorage.setItem('personas', JSON.stringify(authData.personas));
    } catch (error) {
      console.error('Backend sync error:', error);
      throw error;
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    token,
    loading,
    personas,
    signOut,
    refreshToken,
    syncWithBackend,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = (): FirebaseAuthContextType => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};
