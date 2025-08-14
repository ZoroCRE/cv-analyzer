import { useState, useEffect, createContext, ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/api/supabaseClient';

// Define the shape of our custom profile data
export interface UserProfile {
  displayName: string;
  credits: number;
  role: 'user' | 'admin';
}

// Create a new User type that combines Supabase's user with our profile
export type User = SupabaseUser & { profile: UserProfile | null };

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('full_name as displayName, credits, role').eq('id', session.user.id).single();
            setUser({ ...session.user, profile: profile as UserProfile | null });
        }
        setIsLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
            const { data: profile } = await supabase.from('profiles').select('full_name as displayName, credits, role').eq('id', session.user.id).single();
            setUser({ ...session.user, profile: profile as UserProfile | null });
        } else {
            setUser(null);
        }
        setIsLoading(false);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};