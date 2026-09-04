'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export interface UserState {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextValue {
  user: UserState | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isFirebaseClientConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return Boolean(key && !key.includes('your_firebase'));
}

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isDemo = !isFirebaseClientConfigured();

  const syncSession = useCallback(async (idToken: string | null) => {
    if (idToken) {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } else {
      await fetch('/api/auth/session', { method: 'DELETE' });
    }
  }, []);

  useEffect(() => {
    if (!isDemo) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const formatted: UserState = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          };
          setUser(formatted);
          const token = await firebaseUser.getIdToken();
          await syncSession(token);
        } else {
          setUser(null);
          await syncSession(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const savedUser = localStorage.getItem('csr360_demo_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        } catch {
          localStorage.removeItem('csr360_demo_user');
        }
      }
      setLoading(false);
    }
  }, [isDemo, syncSession]);

  const signIn = async (email: string, password: string) => {
    if (!isDemo) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        await syncSession(token);
        router.push('/');
        return;
      } catch (err) {
        console.warn('[Auth] Firebase login failed:', err);
        throw err;
      }
    }

    const demoUser: UserState = {
      uid: 'usr-1',
      email: email || 'admin@csr360.org',
      displayName: 'Aman Verma',
    };
    setUser(demoUser);
    localStorage.setItem('csr360_demo_user', JSON.stringify(demoUser));
    await syncSession(`demo-token-${Date.now()}`);
    router.push('/');
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!isDemo) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        const token = await cred.user.getIdToken();
        await syncSession(token);
        router.push('/');
        return;
      } catch (err) {
        console.warn('[Auth] Firebase signup failed:', err);
        throw err;
      }
    }

    // Demo mode signup
    const demoUser: UserState = {
      uid: `usr-${Date.now()}`,
      email: email || 'admin@csr360.org',
      displayName: displayName || email.split('@')[0],
    };
    setUser(demoUser);
    localStorage.setItem('csr360_demo_user', JSON.stringify(demoUser));
    await syncSession(`demo-token-${Date.now()}`);
    router.push('/');
  };

  const signInWithGoogle = async () => {
    if (!isDemo) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        await syncSession(token);
        router.push('/');
        return;
      } catch (err) {
        console.warn('[Auth] Google sign-in failed:', err);
        throw err;
      }
    }

    // Demo mode Google sign-in
    const demoUser: UserState = {
      uid: 'usr-1',
      email: 'admin@csr360.org',
      displayName: 'Aman Verma',
    };
    setUser(demoUser);
    localStorage.setItem('csr360_demo_user', JSON.stringify(demoUser));
    await syncSession(`demo-token-${Date.now()}`);
    router.push('/');
  };

  const signOut = async () => {
    if (!isDemo) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('[Auth] Firebase signOut error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('csr360_demo_user');
    await syncSession(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
