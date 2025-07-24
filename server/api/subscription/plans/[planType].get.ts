import { getStripe } from '../../../utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const stripe = getStripe();
    const planType = getRouterParam(event, 'planType') as string;

    if (!planType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Plan type is required'
      });
    }

    // Get Stripe product with all prices
    const product = await stripe.products.retrieve(plan.stripe_product_id, {
      expand: ['default_price']
    });

    if (!product || !product.active) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found or inactive in Stripe'
      });
    }

    // Get all prices for this product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });

    // Find monthly and yearly prices
    const monthlyPrice = prices.data.find((price) =>
      price.recurring?.interval === 'month' && price.active
    );

    const yearlyPrice = prices.data.find((price) =>
      price.recurring?.interval === 'year' && price.active
    );

    if (!monthlyPrice) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Monthly pricing not found for this plan'
      });
    }

    // Calculate pricing details
    const monthlyAmount = monthlyPrice.unit_amount || 0;
    const yearlyAmount = yearlyPrice?.unit_amount || 0;
    const hasYearlyOption = !!yearlyPrice;

    let yearlySavings = 0;
    let yearlyEquivalentPrice = 0;

    if (hasYearlyOption && monthlyAmount > 0) {
      const annualCostIfMonthly = monthlyAmount * 12;
      yearlySavings = Math.round((annualCostIfMonthly - yearlyAmount) / 100);
      yearlyEquivalentPrice = yearlyAmount / 12;
    }

    // Transform product data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      monthlyPrice: monthlyAmount / 100,
      yearlyPrice: hasYearlyOption ? yearlyAmount / 100 : null,
      yearlyEquivalentPrice: yearlyEquivalentPrice / 100,
      currency: monthlyPrice.currency.toUpperCase(),
      hasYearlyOption,
      yearlySavings,
      planType: plan.plan_type,
      interval: plan.interval_type,
      features: product.marketing_features || [],
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice?.id || null,
      metadata: product.metadata
    };

    return {
      success: true,
      product: transformedProduct
    };
  } catch (error: any) {
    console.error('Failed to retrieve plan:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve plan'
    });
  }
});
