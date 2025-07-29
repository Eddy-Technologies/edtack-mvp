import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      });
    }

    // Get query parameters for pagination
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 5;
    const offset = (page - 1) * limit;

    // Get user_info_id for the authenticated user
    const { data: userInfo, error: userInfoError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userInfoError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Fetch credit transactions for this user with pagination
    const { data: transactions, error: transactionsError, count } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_info_id', userInfo.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch transactions'
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      transactions: transactions || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error) {
    console.error('Error in transactions API:', error);

    if (error.statusCode) {
      throw error; // Re-throw HTTP errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
