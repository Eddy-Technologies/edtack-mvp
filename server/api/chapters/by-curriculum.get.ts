import { getSupabaseClient } from '~~/server/utils/authConfig';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseClient(event);

  try {
    // Get authenticated user info for filtering
    const userInfo = await getUserInfo(event);
    const query = getQuery(event);

    const {
      subject,
      syllabus_type,
      level_type
    } = query;

    // Start building the query for chapters with subject relationship
    let chaptersQuery = supabase
      .from('chapters')
      .select(`
        name,
        display_name,
        description,
        level,
        parent_id,
        subject_id,
        subjects!inner(name, display_name, subject_name)
      `);

    // Filter by subject if provided
    if (subject) {
      chaptersQuery = chaptersQuery.eq('subjects.name', subject);
    }

    // If user has syllabus_type or level_type, use that to filter available subjects
    if (syllabus_type || level_type || userInfo.syllabus_type || userInfo.level_type) {
      // Get subjects available for this curriculum
      let curriculumQuery = supabase
        .from('curriculum_subjects')
        .select('subject');

      if (syllabus_type) {
        curriculumQuery = curriculumQuery.eq('syllabus_type', syllabus_type);
      } else if (userInfo.syllabus_type) {
        curriculumQuery = curriculumQuery.eq('syllabus_type', userInfo.syllabus_type);
      }

      if (level_type) {
        curriculumQuery = curriculumQuery.eq('level_type', level_type);
      } else if (userInfo.level_type) {
        curriculumQuery = curriculumQuery.eq('level_type', userInfo.level_type);
      }

      const { data: curriculumSubjects } = await curriculumQuery;

      if (curriculumSubjects && curriculumSubjects.length > 0) {
        const subjectNames = curriculumSubjects.map((cs) => cs.subject);
        chaptersQuery = chaptersQuery.in('subjects.name', subjectNames);
      }
    }

    // Order by subject, then by level, then by name
    chaptersQuery = chaptersQuery
      .order('subject_id', { ascending: true })
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    const { data: chapters, error } = await chaptersQuery;

    if (error) {
      console.error('Error fetching chapters:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch chapters'
      });
    }

    // Group chapters by subject for easier frontend consumption
    const groupedChapters: Record<string, {
      subject: any;
      chapters: any[];
    }> = {};

    chapters?.forEach((chapter) => {
      const subjectName = chapter.subjects.name;

      if (!groupedChapters[subjectName]) {
        groupedChapters[subjectName] = {
          subject: chapter.subjects,
          chapters: []
        };
      }

      groupedChapters[subjectName].chapters.push({
        name: chapter.name,
        display_name: chapter.display_name,
        description: chapter.description,
        level: chapter.level,
        parent_id: chapter.parent_id,
        subject_id: chapter.subject_id
      });
    });

    return {
      success: true,
      chapters: groupedChapters,
      totalChapters: chapters?.length || 0
    };
  } catch (err: any) {
    console.error('Unexpected error in chapters endpoint:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to fetch chapters'
    });
  }
});
