import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    // Validate required fields
    if (!body.title || !body.content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title and content are required'
      });
    }

    // Prepare note data
    const noteData = {
      user_id: user.id,
      title: body.title,
      content: body.content,
      category: body.category || null,
      tags: body.tags || [],
      is_pinned: body.is_pinned || false,
      is_archived: body.is_archived || false
    };

    // Create note
    const { data: note, error } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create note: ${error.message}`
      });
    }

    return {
      success: true,
      data: note
    };
  } catch (err: any) {
    console.error('Create note API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create note'
    });
  }
});
