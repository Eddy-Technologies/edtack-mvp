import type { SupabaseClient } from '@supabase/supabase-js';

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient;
  }
  interface ComponentCustomProperties {
    $supabase: SupabaseClient;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient;
  }
}
