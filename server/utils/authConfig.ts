import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Access runtime configuration
const config = useRuntimeConfig();

// Log the values to verify they are loaded during deployment
console.log('[AuthConfig] Initializing...');
console.log('[AuthConfig] JWT_SECRET available:', config.private.jwtSecret ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_URL_FOR_SERVICE_ROLE available:', config.private.supabaseUrlForServiceRole ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_SERVICE_ROLE_KEY available:', config.private.supabaseServiceRoleKey ? 'Yes (set)' : 'No (NOT SET)');
const DEFAULT_JWT_SECRET = 'your_default_fallback_jwt_secret_please_change_me_and_set_env_var';
const DEFAULT_SUPABASE_URL = 'your_default_fallback_supabase_url_please_set_env_var';
const DEFAULT_SUPABASE_SERVICE_KEY = 'your_default_fallback_supabase_service_key_please_set_env_var';

console.log('[AuthConfig] Initializing configuration...');

let jwtSecret = config.private.jwtSecret;
if (!jwtSecret) {
  console.warn('[AuthConfig] WARNING: JWT_SECRET not found in environment variables. Using default fallback. THIS IS INSECURE FOR PRODUCTION.');
  jwtSecret = DEFAULT_JWT_SECRET;
}

let supabaseUrlForServiceRole = config.private.supabaseUrlForServiceRole;
if (!supabaseUrlForServiceRole) {
  console.warn('[AuthConfig] WARNING: SUPABASE_URL_FOR_SERVICE_ROLE not found in environment variables. Using default fallback.');
  supabaseUrlForServiceRole = DEFAULT_SUPABASE_URL;
}

let supabaseServiceRoleKey = config.private.supabaseServiceRoleKey;
if (!supabaseServiceRoleKey) {
  console.warn('[AuthConfig] WARNING: SUPABASE_SERVICE_ROLE_KEY not found in environment variables. Using default fallback. THIS IS INSECURE FOR PRODUCTION.');
  supabaseServiceRoleKey = DEFAULT_SUPABASE_SERVICE_KEY;
}

// Export sensitive keys for use in other server files
export const JWT_SECRET = jwtSecret;
export const SUPABASE_URL_FOR_SERVICE_ROLE = supabaseUrlForServiceRole;
export const SUPABASE_SERVICE_ROLE_KEY = supabaseServiceRoleKey;

// Initialize and export a privileged Supabase client
// This client bypasses RLS and is used for administrative tasks like direct user creation/modification.
export const privilegedSupabaseClient: SupabaseClient = createClient(
  SUPABASE_URL_FOR_SERVICE_ROLE,
  SUPABASE_SERVICE_ROLE_KEY
);
