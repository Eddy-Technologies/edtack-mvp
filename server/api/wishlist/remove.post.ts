import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const { product_id } = body;

    if (!product_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'product_id is required'
      });
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's user_info_id
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Remove from wishlist
    const { error: deleteError } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_info_id', userInfo.id)
      .eq('product_id', product_id);

    if (deleteError) {
      console.error('Failed to remove from wishlist:', deleteError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove item from wishlist'
      });
    }

    return {
      success: true,
      message: 'Item removed from your wishlist',
      productId: product_id
    };
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove item from wishlist'
    });
  }
});
