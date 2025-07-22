import Stripe from 'stripe';

const stripe = new Stripe(useRuntimeConfig().stripeSecretKey, {
  apiVersion: '2025-06-30.basil'
});

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    // Retrieve all active products
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    // For each product, get all prices
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        // Get all prices for this product
        const prices = await stripe.prices.list({
          product: product.id,
          active: true
        });

        // Transform the product data
        const defaultPrice = product.default_price as Stripe.Price | null;

        const transformedProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          metadata: product.metadata,
          images: product.images,
          marketing_features: product.marketing_features,
          prices: prices.data.map((price) => {
            let recurring = null;
            if (price.recurring) {
              recurring = {
                interval: price.recurring.interval,
                interval_count: price.recurring.interval_count
              };
            }

            return {
              id: price.id,
              unit_amount: price.unit_amount,
              currency: price.currency,
              recurring,
              type: price.type
            };
          }),
          default_price: null as any
        };

        if (defaultPrice) {
          let recurring = null;
          if (defaultPrice.recurring) {
            recurring = {
              interval: defaultPrice.recurring.interval,
              interval_count: defaultPrice.recurring.interval_count
            };
          }

          transformedProduct.default_price = {
            id: defaultPrice.id,
            unit_amount: defaultPrice.unit_amount,
            currency: defaultPrice.currency,
            recurring,
            type: defaultPrice.type
          };
        }

        return transformedProduct;
      })
    );

    return {
      success: true,
      products: productsWithPrices
    };
  } catch (error: any) {
    console.error('Failed to retrieve products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve products'
    });
  }
});
