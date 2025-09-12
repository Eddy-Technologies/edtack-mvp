import type Stripe from 'stripe';
import { getStripe } from '../../utils/stripe';
import { STRIPE_LOOKUP_KEYS } from '~~/shared/constants';

export default defineEventHandler(async () => {
  try {
    const stripe = getStripe();

    // Get all prices for the products
    // Currently only offering two products: EDDY_FREE and EDDY_PRO_MONTHLY
    const prices = await stripe.prices.list({
      active: true,
      lookup_keys: [STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY, STRIPE_LOOKUP_KEYS.EDDY_PRO_MONTHLY],
      expand: ['data.product'],
    });

    // For each product, get all prices
    const productsWithPrices = prices.data.map((price) => {
      // Transform the product data
      const product = price.product as Stripe.Product;

      const transformedProduct = {
        id: product.id,
        priceId: price.id,
        name: product.name,
        amount: price.unit_amount,
        currency: price.currency,
        description: product.description,
        marketing_features: product.marketing_features,
        metadata: product.metadata,
        priceLookupKey: price.lookup_key,
        interval: price.recurring?.interval
      };

      return transformedProduct;
    });

    return productsWithPrices;
  } catch (error: any) {
    console.error('Failed to retrieve products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve products'
    });
  }
});
