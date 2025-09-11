import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('name, display_name')
      .order('display_name');

    if (error) {
      console.error('Error fetching subjects:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch subjects'
      });
    }

    // Transform data to match frontend expected format
    const subjectOptions = subjects?.map((subject) => ({
      value: subject.name,
      label: subject.display_name
    })) || [];

    return { subjects: subjectOptions };
  } catch (err: any) {
    console.error('Unexpected error in subjects endpoint:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to fetch subjects'
    });
  }
});
