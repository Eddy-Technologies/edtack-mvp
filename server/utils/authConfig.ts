import type { H3Event } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import { serverSupabaseServiceRole } from '#supabase/server'; // Supabase privileged client for admin tasks
import { useRuntimeConfig } from '#imports'; // Nuxt runtime config

const config = useRuntimeConfig();

// Log the values to verify they are loaded during deployment
console.log('[AuthConfig] Initializing...');
console.log('[AuthConfig] JWT_SECRET available:', config.private.jwtSecret ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_URL_FOR_SERVICE_ROLE available:', config.private.supabaseUrlForServiceRole ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_SERVICE_ROLE_KEY available:', config.private.supabaseServiceRoleKey ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] Initializing configuration...');

// Export sensitive keys for use in other server files
export const JWT_SECRET = config.private.jwtSecret;
export const SUPABASE_URL_FOR_SERVICE_ROLE = config.private.supabaseUrlForServiceRole;
export const SUPABASE_SERVICE_ROLE_KEY = config.private.supabaseServiceRoleKey;

// Expose the service role client in a runtime-safe way
export function getPrivilegedSupabaseClient(event: H3Event) {
  if (!config.private.supabaseServiceRoleKey) {
    console.warn('[AuthConfig] WARNING: SUPABASE_SERVICE_ROLE_KEY not found in env. Check your config.');
  }

  // This client uses the service role key automatically
  return serverSupabaseServiceRole(event);
}

// Example: helper to get RLS-aware client in event handlers (already part of your codebase)
// You typically use this in API routes
export async function getSupabaseClient(event: H3Event) {
  return await serverSupabaseClient(event);
}
