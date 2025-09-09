import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const subject = getRouterParam(event, 'subject');

  if (!subject) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Subject is required'
    });
  }

  const supabase = await getSupabaseClient(event);
  await requireAuth(event);

  try {
    // Get chapters for this subject
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select(`*`)
      .eq('subject_id', subject)
      .order('sort_order', { ascending: true });

    if (chaptersError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch chapters'
      });
    }

    // Format chapters for multi-select dropdown
    const formattedChapters = chapters?.map((chapter) => ({
      value: chapter.name,
      label: chapter.display_name,
      description: chapter.description,
      level: chapter.level
    })) || [];

    return {
      success: true,
      chapters: formattedChapters
    };
  } catch (error: any) {
    console.error('Error fetching chapters by subject:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chapters'
    });
  }
});
