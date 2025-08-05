import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    // Fetch all active codes
    const { data: codes, error } = await supabase
      .from('codes')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('sort_order');

    if (error) {
      console.error('Failed to fetch codes:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch system codes'
      });
    }

    return {
      success: true,
      codes: codes || []
    };
  } catch (error) {
    console.error('Failed to fetch system codes:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch system codes'
    });
  }
});
