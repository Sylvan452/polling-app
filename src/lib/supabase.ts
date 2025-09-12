/**
 * Supabase client configuration for browser
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Get the current session token for API authentication
 * @returns Promise<string | null> - The session access token or null if not authenticated
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    
    return session?.access_token || null
  } catch (error) {
    console.error('Failed to get session token:', error)
    return null
  }
}

/**
 * Check if user is currently authenticated
 * @returns Promise<boolean> - True if user has valid session
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken()
  return token !== null
}