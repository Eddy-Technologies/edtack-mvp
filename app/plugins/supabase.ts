import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const supabaseUrl = config.public.supabaseUrl as string;
  const supabaseAnonKey = config.public.supabaseAnonKey as string;

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  return {
    provide: {
      supabase,
    },
  };
});
