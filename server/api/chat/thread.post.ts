import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody<{ title?: string }>(event);
    // Check if thread exists
    const { data: existingThread, error: selectError } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('id', body.id)
      .single();

    if (existingThread) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Thread already exists',
      });
    }

    const { data, error } = await supabase
      .from('chat_threads')
      .insert({
        user_id: body?.user_id ?? null,
        title: body?.title ?? null,
      })
      .select('*')
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create thread: ${error.message}`,
      });
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Create thread API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create thread',
    });
  }
});
