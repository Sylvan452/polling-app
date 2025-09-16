/**
 * Supabase client configuration for server-side operations
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create a Supabase client for server-side operations with service role key
 * Use this for admin operations that bypass RLS
 */
export function createServiceClient() {
  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      get() {
        return undefined;
      },
    },
  });
}

/**
 * Create a Supabase client for server-side operations with user context
 * Use this for operations that respect RLS and user permissions
 */
export async function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
      },
    },
  );
}

/**
 * Get the default server client (service role for admin operations)
 */
export const supabase = createServiceClient();
