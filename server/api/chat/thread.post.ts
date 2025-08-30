import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody<{ title?: string }>(event);

    const { data, error } = await supabase
      .from('chat_threads')
      .insert({
        user_id: 1,
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
