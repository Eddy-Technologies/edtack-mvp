import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const query = getQuery(event);

    const { limit = 50, offset = 0 } = query;

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

    // Get wishlist items with product details
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        product:products(
          id,
          name,
          description,
          price_cents,
          currency,
          image_url,
          category,
          stock_count,
          discount_percentage,
          discount_amount_cents,
          is_active,
          metadata
        )
      `)
      .eq('user_info_id', userInfo.id)
      .eq('product.is_active', true)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (wishlistError) {
      console.error('Failed to fetch wishlist:', wishlistError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch wishlist items'
      });
    }

    // Format the response
    const formattedItems = wishlistItems?.map((item) => {
      const product = item.product;
      let finalPrice = product.price_cents;
      let originalPrice = null;

      // Calculate discounted price if applicable
      if (product.discount_percentage || product.discount_amount_cents) {
        originalPrice = product.price_cents;
        if (product.discount_percentage) {
          finalPrice = Math.round(product.price_cents * (1 - product.discount_percentage / 100));
        } else if (product.discount_amount_cents) {
          finalPrice = Math.max(0, product.price_cents - product.discount_amount_cents);
        }
      }

      return {
        id: item.id,
        addedAt: item.created_at,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: finalPrice / 100, // Convert cents to dollars
          priceCents: finalPrice,
          originalPrice: originalPrice ? originalPrice / 100 : null,
          originalPriceCents: originalPrice,
          currency: product.currency || 'SGD',
          image: product.image_url || '/placeholder-product.jpg',
          category: product.category,
          stockCount: product.stock_count || 0,
          inStock: (product.stock_count || 0) > 0,
          metadata: product.metadata,
          // Additional computed fields for frontend
          hasDiscount: !!originalPrice,
          discountPercentage: originalPrice ? Math.round((1 - finalPrice / originalPrice) * 100) : 0
        }
      };
    }) || [];

    // Get total count for pagination
    const { count } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_info_id', userInfo.id)
      .eq('product.is_active', true);

    return {
      success: true,
      items: formattedItems,
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasNext: (parseInt(offset as string) + parseInt(limit as string)) < (count || 0)
      }
    };
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wishlist items'
    });
  }
});
