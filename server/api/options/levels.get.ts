import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    const { data: levels, error } = await supabase
      .from('level_types')
      .select('level_type, description')
      .order('level_type');

    if (error) {
      console.error('Error fetching level types:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch level types'
      });
    }

    // Transform data to match frontend expected format
    const levelOptions = levels?.map((level) => ({
      value: level.level_type,
      label: level.description
    })) || [];

    return { levels: levelOptions };
  } catch (err: any) {
    console.error('Unexpected error in levels endpoint:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to fetch level types'
    });
  }
});
