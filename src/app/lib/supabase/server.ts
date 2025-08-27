import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/app/types/database.types';
import { User } from '@/app/types';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    },
  );
}

/**
 * Get the current user (server-side)
 */
export async function getServerUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) return null;
  
  return {
    id: data.user.id,
    name: data.user.user_metadata.name || '',
    email: data.user.email || '',
    createdAt: data.user.created_at,
  };
}
