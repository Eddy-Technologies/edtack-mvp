import { getUserInfo } from '../../utils/auth';
import { getSupabaseClient } from '#imports';
import { codeService } from '~~/server/services/codeService';
import { CODE_CATEGORIES } from '~/stores/codes';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const body = await readBody<{ title?: string; subject?: string }>(event);

    const { data, error } = await supabase
      .from('threads')
      .insert({
        user_infos_id: userInfo.id,
        title: body?.title ?? null,
        subject: body?.subject ?? null,
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
