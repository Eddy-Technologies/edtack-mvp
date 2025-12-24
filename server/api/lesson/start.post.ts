import { getUserInfo } from '../../utils/auth';
import { getPrivilegedSupabaseClient } from '~~/server/utils/authConfig';

interface StartLessonRequest {
  chapterName: string;
  subject: string;
}

interface LessonSlide {
  id: string;
  type: string;
  title: string;
  content: string;
  speech_to_text_content: string;
  question_type: string;
  part_label: string | null;
  syllabus_id: string;
  parent_id: string | null;
  order: number;
  answer: any[];
  explanation: string | null;
  created_at: string;
  updated_at: string;
  source_timestamp: string;
  notes_url: string | null;
}

/**
 * Start a lesson by duplicating seeded lesson slides into a new chat thread
 *
 * If a seeded lesson exists for the chapter (chapters.lesson is not null):
 * - Creates a new thread
 * - Duplicates slides with new UUIDs
 * - Creates a message with the slides
 *
 * If no seeded lesson exists (chapters.lesson is null):
 * - Returns { success: true, hasSeededLesson: false }
 * - Frontend should fallback to AI generation
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = getPrivilegedSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const body = await readBody<StartLessonRequest>(event);

    if (!body.chapterName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'chapterName is required',
      });
    }

    // Check for seeded lesson in chapters table
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('name, display_name, lesson')
      .eq('name', body.chapterName)
      .single();

    if (chapterError || !chapter) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Chapter not found',
      });
    }

    // If no lesson content, fallback to AI generation
    if (!chapter.lesson) {
      return {
        success: true,
        hasSeededLesson: false,
      };
    }

    // Parse the lesson JSON
    let originalSlides: LessonSlide[];
    try {
      originalSlides = JSON.parse(chapter.lesson);
    } catch {
      console.error('Failed to parse lesson JSON for chapter:', body.chapterName);
      return {
        success: true,
        hasSeededLesson: false,
      };
    }

    // Duplicate slides with new UUIDs
    const now = new Date().toISOString();
    const duplicatedSlides = originalSlides.map((slide, index) => ({
      ...slide,
      id: crypto.randomUUID(),
      order: index + 1,
      created_at: now,
      updated_at: now,
    }));

    // Create new thread
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .insert({
        user_infos_id: userInfo.id,
        title: `[Lesson] ${chapter.display_name}`,
        subject: body.subject || null,
      })
      .select('*')
      .single();

    if (threadError || !thread) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create thread: ${threadError?.message}`,
      });
    }

    // Create message with slides
    const messageId = crypto.randomUUID();
    const messageContent = {
      id: messageId,
      status: 'complete',
      slides: duplicatedSlides,
      contentType: 'lesson',
      isStreaming: false,
      message: `Here is your lesson on ${chapter.display_name}.`,
    };

    const { error: messageError } = await supabase
      .from('thread_messages')
      .insert({
        id: messageId,
        thread_id: thread.id,
        sender: null, // AI message
        type: 'json',
        content: JSON.stringify(messageContent),
      });

    if (messageError) {
      // Rollback: delete the orphaned thread
      await supabase.from('threads').delete().eq('id', thread.id);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create message: ${messageError.message}`,
      });
    }

    return {
      success: true,
      hasSeededLesson: true,
      thread,
      slideCount: duplicatedSlides.length,
    };
  } catch (err: any) {
    console.error('Start lesson API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to start lesson',
    });
  }
});
