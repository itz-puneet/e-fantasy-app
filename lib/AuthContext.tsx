// ============================================================================
//  lib/AuthContext.tsx
//  Keeps track of "is someone logged in?" across the whole app, so every
//  screen can ask useAuth() instead of re-checking Supabase itself.
// ============================================================================
import { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from './supabase';

type AuthContextType = {
  session: Session | null; // the logged-in session (null = logged out)
  loading: boolean; // true while we check for an existing session at startup
  isAdmin: boolean; // true if this user has the admin flag (see phase4.sql)
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. On startup, check if the user is already logged in.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2. Listen for login / logout events and update automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Whenever the user changes, look up whether they're an admin. (Safe before
  // phase4.sql is run: if the column is missing the query just returns nothing.)
  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Handy shortcut so any screen can do: const { session } = useAuth();
export const useAuth = () => useContext(AuthContext);
