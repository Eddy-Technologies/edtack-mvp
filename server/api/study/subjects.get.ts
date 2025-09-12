import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const userInfo = await getUserInfo(event);

  try {
    // Get query parameters for filtering
    const query = getQuery(event);
    const levelType = query.level_type as string;
    const syllabusType = query.syllabus_type as string;
    const subjectFilter = query.subject as string;
    const hasCreditsOnly = query.has_credits === 'true';

    // Build the base query
    let subjectsQuery = supabase
      .from('subjects')
      .select(`
        *,
        curriculum_subjects!inner(
          level_type,
          syllabus_type,
          level_types!inner(
            level_type,
            description
          ),
          syllabus_types!inner(
            syllabus_type,
            description
          )
        ),
        chapters(
          name,
          display_name,
          description,
          sort_order,
          user_tasks_chapters(
            id,
            user_task_id,
            chapter_name,
            user_tasks!inner(
              id,
              assignee_user_info_id,
              status,
              credit,
              lesson_generation_type,
              task_threads(
                id,
                thread_id,
                chapter,
                status
              )
            )
          )
        )
      `)
      .order('display_name');

    // Apply filters
    if (levelType) {
      subjectsQuery = subjectsQuery.eq('curriculum_subjects.level_type', levelType);
    }
    if (syllabusType) {
      subjectsQuery = subjectsQuery.eq('curriculum_subjects.syllabus_type', syllabusType);
    }
    if (subjectFilter) {
      subjectsQuery = subjectsQuery.eq('name', subjectFilter);
    }
    if (hasCreditsOnly) {
      subjectsQuery = subjectsQuery
        .not('chapters.user_tasks_chapters', 'is', null)
        .eq('chapters.user_tasks_chapters.user_tasks.assignee_user_info_id', userInfo.id);
    }

    const { data: subjectsData, error: subjectsError } = await subjectsQuery;

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch subjects'
      });
    }

    return {
      success: true,
      subjects: subjectsData,
    };
  } catch (error: any) {
    console.error('Error in study subjects endpoint:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch study subjects'
    });
  }
});
