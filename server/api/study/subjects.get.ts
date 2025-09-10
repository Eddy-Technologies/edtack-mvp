import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';
import { TASK_THREAD_STATUS } from '~~/shared/constants/codes';

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
        name,
        display_name,
        description,
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
            user_tasks!inner(
              id,
              assignee_user_info_id,
              status,
              credit,
              lesson_generation_type
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

    const { data: subjectsData, error: subjectsError } = await subjectsQuery;

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch subjects'
      });
    }

    // Get task threads for chapters
    const { data: taskThreadsData, error: taskThreadsError } = await supabase
      .from('task_threads')
      .select(`
        id,
        thread_id,
        chapter,
        status,
        user_tasks!inner(
          id,
          assignee_user_info_id,
          subject,
          credit
        )
      `)
      .eq('user_tasks.assignee_user_info_id', userInfo.id)
      .eq('status', TASK_THREAD_STATUS.OPEN);

    if (taskThreadsError) {
      console.error('Error fetching task threads:', taskThreadsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch task threads'
      });
    }

    // Create a map of task threads by chapter for quick lookup
    const taskThreadsByChapter = new Map();
    taskThreadsData?.forEach((thread) => {
      const key = `${thread.user_tasks.subject}-${thread.chapter}`;
      if (!taskThreadsByChapter.has(key)) {
        taskThreadsByChapter.set(key, []);
      }
      taskThreadsByChapter.get(key).push(thread);
    });

    // Collect all unique level and syllabus types across all subjects
    const allLevelTypes = new Map<string, string>();
    const allSyllabusTypes = new Map<string, string>();

    subjectsData?.forEach((subject) => {
      subject.curriculum_subjects?.forEach((cs) => {
        if (cs.level_type && cs.level_types) {
          allLevelTypes.set(cs.level_type, cs.level_types.description || cs.level_type);
        }
        if (cs.syllabus_type && cs.syllabus_types) {
          allSyllabusTypes.set(cs.syllabus_type, cs.syllabus_types.description || cs.syllabus_type);
        }
      });
    });

    // Process subjects and enrich with task thread information
    const processedSubjects = subjectsData?.map((subject) => {
      // Calculate total available credits for this subject
      let totalCredits = 0;

      // Process chapters and add task thread information
      const enrichedChapters = subject.chapters
        ?.sort((a, b) => a.sort_order - b.sort_order)
        .map((chapter) => {
          const chapterKey = `${subject.name}-${chapter.name}`;
          const chapterTaskThreads = taskThreadsByChapter.get(chapterKey) || [];

          // Check if this chapter has user tasks (for quiz availability)
          const hasUserTasks = chapter.user_tasks_chapters &&
            chapter.user_tasks_chapters.some((utc) =>
              utc.user_tasks.assignee_user_info_id === userInfo.id &&
              utc.user_tasks.status === 'OPEN'
            );

          // Calculate credits for this chapter
          let chapterCredits = 0;
          if (hasUserTasks) {
            chapter.user_tasks_chapters.forEach((utc) => {
              if (utc.user_tasks.assignee_user_info_id === userInfo.id) {
                chapterCredits += utc.user_tasks.credit;
              }
            });
          }
          totalCredits += chapterCredits;

          return {
            name: chapter.name,
            display_name: chapter.display_name,
            description: chapter.description,
            sort_order: chapter.sort_order,
            hasUserTasks,
            taskThreads: chapterTaskThreads,
            credits: chapterCredits
          };
        }) || [];

      // For each subject, we still need to store level/syllabus info for filtering
      // We'll use the first one for the subject's primary classification
      const primaryCurriculum = subject.curriculum_subjects?.[0];

      return {
        name: subject.name,
        display_name: subject.display_name,
        description: subject.description,
        level_type: primaryCurriculum?.level_type,
        level_type_description: primaryCurriculum?.level_types?.description,
        syllabus_type: primaryCurriculum?.syllabus_type,
        syllabus_type_description: primaryCurriculum?.syllabus_types?.description,
        chapters: enrichedChapters,
        totalCredits
      };
    }).filter((subject) => {
      // Apply credits filter if requested
      if (hasCreditsOnly) {
        return subject.totalCredits > 0;
      }
      return true;
    }) || [];

    return {
      success: true,
      subjects: processedSubjects,
      availableLevelTypes: Object.fromEntries(allLevelTypes),
      availableSyllabusTypes: Object.fromEntries(allSyllabusTypes)
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
