import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const supabaseUrl = config.public.supabaseUrl as string;
  const supabaseAnonKey = config.public.supabaseAnonKey as string;

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  // Provide $supabase to Nuxt app
  nuxtApp.provide('supabase', supabase);
});
