/**
 * Edit/Update a user task (parent-only)
 *
 * PATCH /api/tasks/user-tasks/[id]
 *
 * Permission: Only the creator (parent) can edit a task
 *
 * Body:
 * - name: string (task name)
 * - creditPerChapter: number (credits per chapter)
 * - requiredScore: number (0-100, required passing percentage)
 * - questionsPerQuiz: number (1-50, number of questions)
 * - status: string (OPEN | CLOSED)
 * - chapters: string[] (OPTIONAL: array of chapter IDs to update)
 *
 * Returns:
 * - success: boolean
 * - task: updated task object
 */

import { getUserInfo } from '~~/server/utils/auth';
import { getSupabaseClient } from '~~/server/utils/authConfig';

export default defineEventHandler(async (event) => {
  try {
    const userInfo = await getUserInfo(event);
    const taskId = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!taskId) {
      throw createError({
        statusCode: 400,
        message: 'Task ID is required'
      });
    }

    const supabase = await getSupabaseClient(event);

    // Verify user is the creator (parent) of this task
    const { data: task, error: fetchError } = await supabase
      .from('user_tasks')
      .select('creator_user_info_id, user_tasks_chapters(id, completed_at)')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      console.error('[edit-task] Error fetching task:', fetchError);
      throw createError({
        statusCode: 404,
        message: 'Task not found'
      });
    }

    if (task.creator_user_info_id !== userInfo.id) {
      console.warn('[edit-task] Permission denied: User is not the task creator');
      throw createError({
        statusCode: 403,
        message: 'Unauthorized: You can only edit tasks you created'
      });
    }

    // Validate input
    if (body.requiredScore !== undefined && (body.requiredScore < 0 || body.requiredScore > 100)) {
      throw createError({
        statusCode: 400,
        message: 'Required score must be between 0 and 100'
      });
    }

    if (body.questionsPerQuiz !== undefined && (body.questionsPerQuiz < 1 || body.questionsPerQuiz > 50)) {
      throw createError({
        statusCode: 400,
        message: 'Questions per quiz must be between 1 and 50'
      });
    }

    if (body.creditPerChapter !== undefined && body.creditPerChapter < 0) {
      throw createError({
        statusCode: 400,
        message: 'Credits must be non-negative'
      });
    }

    // Update task
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.creditPerChapter !== undefined) {
      updateData.credit = body.creditPerChapter;
    }

    if (body.requiredScore !== undefined) {
      updateData.required_score = body.requiredScore;
    }

    if (body.questionsPerQuiz !== undefined) {
      updateData.questions_per_quiz = body.questionsPerQuiz;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('user_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('[edit-task] Error updating task:', updateError);
      throw createError({
        statusCode: 500,
        message: 'Failed to update task'
      });
    }

    // Handle chapter updates if provided
    if (body.chapters && Array.isArray(body.chapters)) {
      // Get current chapters for this task
      const { data: currentChapters, error: fetchChaptersError } = await supabase
        .from('user_tasks_chapters')
        .select('id, chapter_name, completed_at')
        .eq('user_task_id', taskId);

      if (fetchChaptersError) {
        console.error('[edit-task] Error fetching current chapters:', fetchChaptersError);
        throw createError({
          statusCode: 500,
          message: 'Failed to fetch current chapters'
        });
      }

      if (currentChapters) {
        const currentChapterIds = currentChapters.map((c) => c.id);
        const newChapterIds = body.chapters;

        // Find chapters to add (in new list but not in current)
        const chaptersToAdd = newChapterIds.filter((id: string) => !currentChapterIds.includes(id));

        // Find chapters to remove (in current but not in new list)
        const chaptersToRemove = currentChapters.filter(
          (c) => !newChapterIds.includes(c.id)
        );

        // Validate: Cannot remove chapters that have been attempted
        const attemptedChaptersToRemove = chaptersToRemove.filter((c) => c.completed_at !== null);
        if (attemptedChaptersToRemove.length > 0) {
          throw createError({
            statusCode: 400,
            message: 'Cannot remove chapters that have been attempted'
          });
        }

        // Insert new chapters (need to map IDs to names)
        if (chaptersToAdd.length > 0) {
          // Get chapter names from IDs
          const { data: chapterData, error: chapterLookupError } = await supabase
            .from('chapters')
            .select('id, name')
            .in('id', chaptersToAdd);

          if (chapterLookupError || !chapterData) {
            console.error('[edit-task] Error looking up chapter names:', chapterLookupError);
            throw createError({
              statusCode: 500,
              message: 'Failed to lookup chapter information'
            });
          }

          const chapterInserts = chapterData.map((chapter) => ({
            user_task_id: taskId,
            chapter_name: chapter.name
          }));

          const { error: insertError } = await supabase
            .from('user_tasks_chapters')
            .insert(chapterInserts);

          if (insertError) {
            console.error('[edit-task] Error inserting new chapters:', insertError);
            throw createError({
              statusCode: 500,
              message: 'Failed to add new chapters'
            });
          }
        }

        // Delete removed chapters (only non-attempted ones pass validation above)
        if (chaptersToRemove.length > 0) {
          const idsToDelete = chaptersToRemove.map((c) => c.id);
          const { error: deleteError } = await supabase
            .from('user_tasks_chapters')
            .delete()
            .in('id', idsToDelete);

          if (deleteError) {
            console.error('[edit-task] Error deleting chapters:', deleteError);
            throw createError({
              statusCode: 500,
              message: 'Failed to remove chapters'
            });
          }
        }
      }
    }

    return {
      success: true,
      task: updatedTask
    };
  } catch (error: any) {
    console.error('[edit-task] Error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update task'
    });
  }
});
