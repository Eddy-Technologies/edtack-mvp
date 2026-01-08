import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_STATUS } from '~~/shared/constants';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);
  const userInfo = await getUserInfo(event);

  try {
    // Get query parameters for filtering
    const query = getQuery(event);
    const syllabusType = query.syllabus_type as string;
    const subjectFilter = query.subject as string;
    const hasCreditsOnly = query.has_credits === 'true';
    // Role is passed from frontend (already available in meStore) to avoid extra DB query
    const role = query.role as string;

    const isParent = role === 'PARENT';

    // Query 1: Get subjects with curriculum info and chapters (no deeply nested task data)
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
          sort_order
        )
      `)
      .eq('is_active', true)
      .order('display_name')
      .order('sort_order', { referencedTable: 'chapters' });

    // Apply syllabus and subject filters
    if (syllabusType) {
      subjectsQuery = subjectsQuery.eq('curriculum_subjects.syllabus_type', syllabusType);
    }
    if (subjectFilter) {
      subjectsQuery = subjectsQuery.eq('name', subjectFilter);
    }

    // Query 2: Get user's tasks with chapters - focused query on just user's data
    let userTasksQuery = supabase
      .from('user_tasks_chapters')
      .select(`
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
      `)
      .neq('user_tasks.status', TASK_STATUS.EXPIRED);

    // Apply role-based filtering
    if (isParent) {
      userTasksQuery = userTasksQuery.eq('user_tasks.creator_user_info_id', userInfo.id);
    } else {
      userTasksQuery = userTasksQuery.eq('user_tasks.assignee_user_info_id', userInfo.id);
    }

    // Apply credits filter at database level (if hasCreditsOnly)
    if (hasCreditsOnly) {
      userTasksQuery = userTasksQuery.gt('user_tasks.credit', 0);
    }

    // Execute both queries in parallel
    const [subjectsResult, userTasksResult] = await Promise.all([
      subjectsQuery,
      userTasksQuery,
    ]);

    if (subjectsResult.error) {
      console.error('Error fetching subjects:', subjectsResult.error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch subjects'
      });
    }

    if (userTasksResult.error) {
      console.error('Error fetching user tasks:', userTasksResult.error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user tasks'
      });
    }

    // Build a map of chapter_name -> user_tasks_chapters for O(1) lookup
    const tasksByChapter = new Map<string, any[]>();
    for (const utc of userTasksResult.data || []) {
      if (!tasksByChapter.has(utc.chapter_name)) {
        tasksByChapter.set(utc.chapter_name, []);
      }
      tasksByChapter.get(utc.chapter_name)!.push(utc);
    }

    // Merge tasks into subjects (fast in-memory operation)
    const subjects = (subjectsResult.data || []).map((subject: any) => ({
      ...subject,
      chapters: subject.chapters.map((chapter: any) => ({
        ...chapter,
        user_tasks_chapters: tasksByChapter.get(chapter.name) || [],
      })),
    }));

    // Filter subjects that have no tasks when hasCreditsOnly is true
    let filteredSubjects = subjects;
    if (hasCreditsOnly) {
      filteredSubjects = subjects.filter((subject: any) =>
        subject.chapters.some((chapter: any) => chapter.user_tasks_chapters.length > 0)
      );
    }

    return {
      success: true,
      subjects: filteredSubjects,
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
