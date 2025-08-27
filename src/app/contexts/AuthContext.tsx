'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import { supabaseAuth } from '@/app/lib/supabase/auth';
import { supabase } from '@/app/lib/supabase/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (name: string, email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const currentUser = await supabaseAuth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication state:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const currentUser = await supabaseAuth.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await supabaseAuth.signIn(email, password);
      if (user) {
        setUser(user);
        router.push('/polls');
      }
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      return null;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const user = await supabaseAuth.signUp(name, email, password);
      if (user) {
        setUser(user);
        router.push('/polls');
      }
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabaseAuth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}