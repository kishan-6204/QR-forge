import { createContext, useContext, useMemo, useState } from 'react';
import { firebaseAuthApi } from '../lib/firebaseClient';

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

  const persist = (nextSession) => {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  };

  const signIn = async ({ email, password }) => {
    const nextSession = await firebaseAuthApi.signIn(email, password);
    persist(nextSession);
    return nextSession;
  };

  const signUp = async ({ email, password }) => {
    const nextSession = await firebaseAuthApi.signUp(email, password);
    persist(nextSession);
    return nextSession;
  };

  const signOut = () => persist(null);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.idToken),
      signIn,
      signUp,
      signOut
    }),
    [session]
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
