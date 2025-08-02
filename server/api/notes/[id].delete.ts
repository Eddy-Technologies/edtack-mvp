import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Note ID is required'
      });
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    // Delete note (ensure user owns the note)
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Security: ensure user owns the note

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Note not found or you do not have permission to delete it'
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete note: ${error.message}`
      });
    }

    return {
      success: true,
      message: 'Note deleted successfully'
    };
  } catch (err: any) {
    console.error('Delete note API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete note'
    });
  }
});
