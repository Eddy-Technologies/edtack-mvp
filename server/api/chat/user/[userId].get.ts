import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'userId');

    const { data, error } = await supabase
      .from('threads')
      .select('*, thread_messages(*), task_threads(*)')
      .eq('user_infos_id', id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch chat threads:', error.message);
      return;
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Fetch threads API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch threads' });
  }
});
