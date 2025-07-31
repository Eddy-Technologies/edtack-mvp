export default defineNitroPlugin(async () => {
  console.log('[Startup] Initializing code cache...');

  try {
    // Import Supabase client directly
    const { createClient } = await import('@supabase/supabase-js');
    const config = useRuntimeConfig();

    // Create direct service role client for startup initialization
    const supabase = createClient(
      config.private.supabaseUrl,
      config.private.supabaseServiceRoleKey
    );

    // Import and warm up the code service cache
    const { codeService } = await import('../services/codeService');
    await codeService.loadCodes(supabase);

    console.log('[Startup] Code cache initialized successfully');
  } catch (error) {
    console.error('[Startup] Failed to initialize code cache:', error);
    // Don't throw - let the server start even if cache warming fails
  }
});
