import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service role key.
 * Only use this in API Route Handlers and Server Actions — never in the browser.
 */
export function createServerClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
