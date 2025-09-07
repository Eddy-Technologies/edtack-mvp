import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'userId');

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    });
  }

  const supabase = await getSupabaseClient(event);
  const userInfo = await getUserInfo(event);

  try {
    // Get the child's syllabus_type and level_type
    const { data: childInfo, error: childError } = await supabase
      .from('user_infos')
      .select('syllabus_type, level_type')
      .eq('id', userId)
      .single();

    if (childError || !childInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Child not found'
      });
    }

    if (!childInfo.syllabus_type || !childInfo.level_type) {
      return {
        success: true,
        subjects: []
      };
    }

    // Get subjects for this syllabus_type and level_type
    const { data: curriculumSubjects, error: subjectsError } = await supabase
      .from('curriculum_subjects')
      .select(`
        subject,
        subjects!inner(*)
      `)
      .eq('syllabus_type', childInfo.syllabus_type)
      .eq('level_type', childInfo.level_type);

    if (subjectsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch curriculum subjects'
      });
    }

    // Format subjects for dropdown options
    const subjects = curriculumSubjects?.map((cs) => ({
      value: cs.subject,
      label: cs.subjects.display_name,
    })) || [];

    return {
      success: true,
      subjects
    };
  } catch (error: any) {
    console.error('Error fetching curriculum subjects:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch curriculum subjects'
    });
  }
});
