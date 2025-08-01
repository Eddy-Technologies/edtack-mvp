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

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found or inactive'
      });
    }

    // Check if item is already in wishlist
    const { data: existingItem } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_info_id', userInfo.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      return {
        success: true,
        message: 'Item is already in your wishlist',
        alreadyExists: true
      };
    }

    // Add to wishlist
    const { data: wishlistItem, error: insertError } = await supabase
      .from('wishlists')
      .insert({
        user_info_id: userInfo.id,
        product_id: product_id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to add to wishlist:', insertError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to add item to wishlist'
      });
    }

    return {
      success: true,
      message: `${product.name} added to your wishlist!`,
      wishlistItem: {
        id: wishlistItem.id,
        productId: product_id,
        addedAt: wishlistItem.created_at
      }
    };
  } catch (error) {
    console.error('Failed to add to wishlist:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add item to wishlist'
    });
  }
});
