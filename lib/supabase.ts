import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the current domain for redirects
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use current domain
    return window.location.origin;
  }
  // SSR should use the deployment URL or localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: `${getBaseUrl()}/auth/callback`
  }
});