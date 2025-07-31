import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    // Get all active products from database
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching products:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products from database'
      });
    }

    console.log(`[Products API] Found ${products?.length || 0} products in database`);

    if (!products) {
      return {
        products: [],
        total: 0,
        categories: []
      };
    }

    console.log(`Found ${products.length} active products from database`);

    // Helper function to calculate discounted price
    const calculateDiscountedPrice = (product: any) => {
      const now = new Date();
      const startDate = product.discount_start_date ? new Date(product.discount_start_date) : null;
      const endDate = product.discount_end_date ? new Date(product.discount_end_date) : null;

      // Check if discount is currently active
      const isDiscountActive = (!startDate || now >= startDate) && (!endDate || now <= endDate);

      if (!isDiscountActive) {
        return {
          price: product.price_cents / 100,
          originalPrice: null,
          discountPercentage: null,
          isOnSale: false
        };
      }

      let discountedPriceCents = product.price_cents;
      let discountPercentage = null;

      // Apply percentage discount first
      if (product.discount_percentage && product.discount_percentage > 0) {
        discountedPriceCents = Math.round(product.price_cents * (1 - product.discount_percentage / 100));
        discountPercentage = product.discount_percentage;
      }

      // Apply fixed discount amount
      if (product.discount_amount_cents && product.discount_amount_cents > 0) {
        discountedPriceCents = Math.max(0, discountedPriceCents - product.discount_amount_cents);
      }

      return {
        price: discountedPriceCents / 100,
        originalPrice: product.price_cents / 100,
        discountPercentage,
        isOnSale: discountedPriceCents < product.price_cents
      };
    };

    // Transform database products to shop format
    const transformedProducts = products.map((product) => {
      const pricingInfo = calculateDiscountedPrice(product);

      return {
        id: product.id,
        name: product.name,
        description: product.description || 'No description available',
        price: pricingInfo.price,
        originalPrice: pricingInfo.originalPrice,
        discountPercentage: pricingInfo.discountPercentage,
        isOnSale: pricingInfo.isOnSale,
        image: product.image_url || '/placeholder-product.png',
        category: product.category || 'Other',
        rating: Math.max(0, Math.min(5, parseFloat(product.metadata?.rating || '4.5'))), // Clamp between 0-5
        reviewCount: Math.max(0, parseInt(product.metadata?.review_count || '0')),
        isNew: product.metadata?.is_new === 'true',
        availability: product.metadata?.availability || 'in_stock',
        metadata: {
          product_type: product.product_type,
          currency: product.currency || 'SGD'
        }
      };
    });

    return {
      products: transformedProducts,
      total: transformedProducts.length,
      categories: [...new Set(transformedProducts.map((p) => p.category))]
    };
  } catch (error) {
    console.error('Failed to get shop products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve shop products'
    });
  }
});
