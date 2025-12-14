import type { H3Event } from 'h3';
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server';
import { useRuntimeConfig } from '#imports'; // Nuxt runtime config
import type { Database } from '~~/types/supabase';

const config = useRuntimeConfig();

// Export sensitive keys for use in other server files
export const JWT_SECRET = config.private.jwtSecret;
export const SUPABASE_SERVICE_ROLE_KEY = config.private.supabaseServiceRoleKey;

// Expose the service role client in a runtime-safe way
export function getPrivilegedSupabaseClient(event: H3Event) {
  if (!config.private.supabaseServiceRoleKey) {
    console.warn(
      '[AuthConfig] WARNING: SUPABASE_SERVICE_ROLE_KEY not found in env. Check your config.'
    );
  }

  // This client uses the service role key automatically
  return serverSupabaseServiceRole<Database>(event);
}

// Example: helper to get RLS-aware client in event handlers (already part of your codebase)
// You typically use this in API routes
export async function getSupabaseClient(event: H3Event) {
  return await serverSupabaseClient<Database>(event);
}
