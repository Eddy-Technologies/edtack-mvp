import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Note ID is required'
      });
    }

    // Get authenticated user
    const user = await requireAuth(event);

    // Prepare update data (only include fields that are provided)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.is_pinned !== undefined) updateData.is_pinned = body.is_pinned;
    if (body.is_archived !== undefined) updateData.is_archived = body.is_archived;

    // Update note (ensure user owns the note)
    const { data: note, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Security: ensure user owns the note
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Note not found or you do not have permission to edit it'
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update note: ${error.message}`
      });
    }

    return {
      success: true,
      data: note
    };
  } catch (err: any) {
    console.error('Update note API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update note'
    });
  }
});
