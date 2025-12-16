import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_STATUS } from '~~/shared/constants';

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

    // Get user's role to determine task filtering
    const { data: roleData } = await supabase
      .from('user_infos')
      .select('user_roles!inner(roles!inner(role_name))')
      .eq('id', userInfo.id)
      .single();

    const isParent = roleData?.user_roles?.roles?.role_name === 'PARENT';

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
            status,
            score,
            total_score,
            completed_at,
            user_tasks!inner(
              id,
              name,
              creator_user_info_id,
              assignee_user_info_id,
              status,
              credit,
              required_score,
              questions_per_quiz,
              lesson_generation_type
            )
          )
        )
      `)
      .eq('is_active', true)
      .order('display_name');

    // Apply role-based filtering for tasks
    // Parents see tasks they created, Students see tasks assigned to them
    if (isParent) {
      subjectsQuery = subjectsQuery.eq('chapters.user_tasks_chapters.user_tasks.creator_user_info_id', userInfo.id);
    } else {
      subjectsQuery = subjectsQuery.eq('chapters.user_tasks_chapters.user_tasks.assignee_user_info_id', userInfo.id);
    }

    // Exclude EXPIRED tasks from Study Tab
    subjectsQuery = subjectsQuery.neq('chapters.user_tasks_chapters.user_tasks.status', TASK_STATUS.EXPIRED);

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
        .not('chapters.user_tasks_chapters', 'is', null);
      // Role-based filter already applied above, no need to duplicate assignee filter
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
