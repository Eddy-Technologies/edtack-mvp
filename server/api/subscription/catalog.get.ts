import { getSupabaseClient } from '#imports';
import { getStripe } from '../../plugins/stripe';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();
    
    // Check if this is a request for a specific plan
    const planType = getQuery(event).planType as string;
    
    if (planType) {
      // Handle specific plan request (from old plans/[planType] functionality)
      return await getSpecificPlan(supabase, stripe, planType);
    } else {
      // Handle all products request (from old products functionality)
      return await getAllProducts(stripe);
    }
  } catch (error: any) {
    console.error('Failed to retrieve catalog:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve catalog'
    });
  }
});

// Get all products (original products.get.ts functionality)
async function getAllProducts(stripe: any) {
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
      const defaultPrice = product.default_price as any;

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
}

// Get specific plan (original plans/[planType].get.ts functionality)
async function getSpecificPlan(supabase: any, stripe: any, planType: string) {
  // Get subscription plan from database
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('plan_type', planType)
    .single();

  if (planError || !plan) {
    // Get all available plans for debugging
    const { data: allPlans } = await supabase
      .from('subscription_plans')
      .select('plan_type, display_name')
      .order('created_at', { ascending: true });

    const availableTypes = allPlans?.map((p) => p.plan_type).join(', ') || 'none';

    throw createError({
      statusCode: 404,
      statusMessage: `Subscription plan '${planType}' not found. Available plan types: ${availableTypes}`
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
}