import { getSupabaseClient } from '#imports';
import { codeService } from '~~/server/services/codeService';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    const frequencies = await codeService.getCodesByCategory(supabase, 'recurrence_frequency');

    return {
      success: true,
      frequencies: frequencies.map((freq) => ({
        value: freq.code,
        label: freq.name,
        description: freq.description
      }))
    };
  } catch (error) {
    console.error('Failed to fetch recurrence frequencies:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch recurrence frequencies'
    });
  }
});
