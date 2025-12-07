import { getUserInfo } from '~~/server/utils/auth';
import { getTokenUsageSummary } from '~~/server/services/tokenUsageService';

export default defineEventHandler(async (event) => {
  try {
    const userInfo = await getUserInfo(event);
    const supabase = await getSupabaseClient(event);

    const summary = await getTokenUsageSummary(supabase, userInfo.id);

    return summary;
  } catch (error) {
    console.error('[TokenUsageAPI] Failed to fetch usage:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch token usage'
    });
  }
});
