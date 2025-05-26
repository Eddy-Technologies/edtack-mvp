import { serverSupabaseClient } from '#supabase/server';
import { serverSupabaseServiceRole } from '#supabase/server'; // Supabase privileged client for admin tasks
import { useRuntimeConfig } from '#imports'; // Nuxt runtime config

// Helper to get JWT secret (optional fallback for dev)
export function getJwtSecret(): string {
  const config = useRuntimeConfig();
  const jwtSecret = config.private.jwtSecret;

  if (!jwtSecret) {
    console.warn('[AuthConfig] WARNING: JWT_SECRET not found in env. Check your config.');
    return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // Fallback (INSECURE!)
  }

  return jwtSecret;
}

// Expose the service role client in a runtime-safe way
export function getPrivilegedSupabaseClient() {
  const config = useRuntimeConfig();

  if (!config.private.supabaseServiceRoleKey) {
    console.warn('[AuthConfig] WARNING: SUPABASE_SERVICE_ROLE_KEY not found in env. Check your config.');
  }

  // This client uses the service role key automatically
  return serverSupabaseServiceRole();
}

// Example: helper to get RLS-aware client in event handlers (already part of your codebase)
// You typically use this in API routes
export async function getSupabaseClient(event) {
  return await serverSupabaseClient(event);
}
