import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseAuthApi, firestoreApi, signInWithGoogle, signOutAuth } from '../lib/firebaseClient';

const AuthContext = createContext(null);
const STORAGE_KEY = 'qrforge-auth';

const getInitialAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.idToken || !parsed?.uid || !parsed?.email) return null;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getInitialAuth);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(session?.idToken));

  const persist = (nextSession) => {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  };

  const ensureProfile = async (nextSession) => {
    if (!nextSession?.idToken) return null;
    setProfileLoading(true);
    try {
      const profilePayload = {
        uid: nextSession.uid,
        email: nextSession.email,
        name: nextSession.displayName || nextSession.email?.split('@')[0] || 'QR Forge User',
        photoURL: nextSession.photoURL || '',
        createdAt: new Date().toISOString(),
        theme: 'light',
        defaultQrColor: '#111827',
        defaultQrSize: 512
      };
      const nextProfile = await firestoreApi.ensureUserProfile({
        idToken: nextSession.idToken,
        profile: profilePayload
      });
      setProfile(nextProfile);
      return nextProfile;
    } finally {
      setProfileLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    const nextSession = await firebaseAuthApi.signIn(email, password);
    persist(nextSession);
    await ensureProfile(nextSession);
    return nextSession;
  };

  const signUp = async ({ email, password }) => {
    const nextSession = await firebaseAuthApi.signUp(email, password);
    persist(nextSession);
    await ensureProfile(nextSession);
    return nextSession;
  };

  const signInWithGoogleHandler = async () => {
    const nextSession = await signInWithGoogle();
    persist(nextSession);
    await ensureProfile(nextSession);
    return nextSession;
  };

  const signOut = () => {
    signOutAuth().catch(() => null);
    persist(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!session?.idToken) return null;
    setProfileLoading(true);
    try {
      const nextProfile = await firestoreApi.getUserProfile({ idToken: session.idToken, uid: session.uid });
      setProfile(nextProfile);
      return nextProfile;
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!session?.idToken) {
      throw new Error('No active session found');
    }
    const nextProfile = await firestoreApi.updateUserProfile({
      idToken: session.idToken,
      uid: session.uid,
      updates
    });
    if (nextProfile) {
      setProfile(nextProfile);
    }
    return nextProfile;
  };

  useEffect(() => {
    if (!session?.idToken) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    ensureProfile(session);
  }, [session?.idToken]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.idToken),
      signIn,
      signUp,
      signInWithGoogle: signInWithGoogleHandler,
      signOut,
      profile,
      profileLoading,
      refreshProfile,
      updateProfile
    }),
    [session, profile, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
