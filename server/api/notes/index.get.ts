import { getSupabaseClient } from '#imports';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    // Get authenticated user
    const user = await requireAuth(event);

    // Extract query parameters
    const searchTerm = query.search as string;
    const category = query.category as string;
    const tags = query.tags ? (Array.isArray(query.tags) ? query.tags : [query.tags]) : null;
    const archived = query.archived === 'true';
    const limit = query.limit ? parseInt(query.limit as string) : 20;
    const offset = query.offset ? parseInt(query.offset as string) : 0;

    // Use the search function if search parameters are provided
    if (searchTerm || category || tags) {
      const { data: notes, error } = await supabase.rpc('search_notes', {
        p_user_id: user.id,
        p_search_term: searchTerm || null,
        p_category: category || null,
        p_tags: tags,
        p_archived: archived
      });

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to search notes: ${error.message}`
        });
      }

      // Apply pagination to results
      const paginatedNotes = notes?.slice(offset, offset + limit) || [];

      return {
        success: true,
        data: paginatedNotes,
        count: paginatedNotes.length,
        total: notes?.length || 0
      };
    } else {
      // Simple query without search
      const notesQuery = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', archived)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: notes, error } = await notesQuery;

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to fetch notes: ${error.message}`
        });
      }

      // Get total count
      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_archived', archived);

      return {
        success: true,
        data: notes || [],
        count: notes?.length || 0,
        total: count || 0
      };
    }
  } catch (err: any) {
    console.error('Notes API error:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch notes'
    });
  }
});
