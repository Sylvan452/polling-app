import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@/app/types';

/**
 * Client-side authentication functions using Supabase
 */
export const supabaseAuth = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string): Promise<User | null> => {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return null;
    }

    if (!data.user) return null;

    return {
      id: data.user.id,
      name: data.user.user_metadata.name || '',
      email: data.user.email || '',
      createdAt: data.user.created_at,
    };
  },

  /**
   * Sign up with email and password
   */
  signUp: async (
    name: string,
    email: string,
    password: string,
  ): Promise<User | null> => {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error.message);
      return null;
    }

    if (!data.user) return null;

    return {
      id: data.user.id,
      name: data.user.user_metadata.name || '',
      email: data.user.email || '',
      createdAt: data.user.created_at,
    };
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
  },

  /**
   * Get the current user (client-side)
   */
  getCurrentUser: async (): Promise<User | null> => {
    const supabase = createClientComponentClient();

    const { data } = await supabase.auth.getUser();

    if (!data.user) return null;

    return {
      id: data.user.id,
      name: data.user.user_metadata.name || '',
      email: data.user.email || '',
      createdAt: data.user.created_at,
    };
  },
};

/**
 * Get the current user (client-side version for use in client components)
 */
export const getServerUser = async (): Promise<User | null> => {
  const supabase = createClientComponentClient();

  const { data } = await supabase.auth.getUser();

  if (!data.user) return null;

  return {
    id: data.user.id,
    name: data.user.user_metadata.name || '',
    email: data.user.email || '',
    createdAt: data.user.created_at,
  };
};
