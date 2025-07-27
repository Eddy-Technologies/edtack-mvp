import { getStripe } from '~~/server/utils/stripe';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();

    // Get all active products from Stripe
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price']
    });

    // CRITICAL: Only return products with metadata.product_type === 'shop'
    // This ensures subscription products are NEVER shown in the shop
    const shopProducts = products.data.filter((product) => {
      const productType = product.metadata?.product_type;
      return productType === 'shop';
    });

    console.log(`Found ${products.data.length} total products, ${shopProducts.length} shop products`);

    // Transform Stripe products to our shop format
    const transformedProducts = shopProducts.map((product) => {
      const price = product.default_price as any;
      const unitAmount = price?.unit_amount || 0;

      // Ensure price conversion is safe (1 credit = 10 cents)
      const creditsPrice = Math.max(0, Math.floor(unitAmount / 10));

      return {
        id: product.id,
        name: product.name || 'Unnamed Product',
        description: product.description || 'No description available',
        price: creditsPrice,
        originalPrice: product.metadata?.original_price ? parseInt(product.metadata.original_price) : undefined,
        image: product.images[0] || '/placeholder-product.png',
        category: product.metadata?.category || 'Other',
        rating: Math.max(0, Math.min(5, parseFloat(product.metadata?.rating || '4.5'))), // Clamp between 0-5
        reviewCount: Math.max(0, parseInt(product.metadata?.review_count || '0')),
        isNew: product.metadata?.is_new === 'true',
        availability: product.metadata?.availability || 'in_stock',
        metadata: {
          stripe_product_id: product.id,
          stripe_price_id: price?.id,
          product_type: product.metadata?.product_type,
          vendor_id: product.metadata?.vendor_id || null,
          currency: price?.currency || 'usd'
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
