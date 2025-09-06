import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    const { data: syllabusTypes, error } = await supabase
      .from('syllabus_types')
      .select('syllabus_type, description')
      .order('syllabus_type');

    if (error) {
      console.error('Error fetching syllabus types:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch syllabus types'
      });
    }

    // Transform data to match frontend expected format
    const syllabusOptions = syllabusTypes?.map((syllabus) => ({
      value: syllabus.syllabus_type,
      label: syllabus.description
    })) || [];

    return { syllabus: syllabusOptions };
  } catch (err: any) {
    console.error('Unexpected error in syllabus endpoint:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to fetch syllabus types'
    });
  }
});
