import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;
interface StripeCustomerData {
  email: string;
  user_info_id: string;
  firstName?: string | null;
  lastName?: string | null;
}

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const config = useRuntimeConfig();

    if (!config.private.stripeSecretKey) {
      throw new Error('Stripe secret key is not configured. Please set NUXT_STRIPE_SECRET_KEY in your environment variables.');
    }

    stripeInstance = new Stripe(config.private.stripeSecretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
}

// use this to get price details with product information
export async function getPriceWithProductByPriceId(priceId: string) {
  const stripe = getStripe();

  const price = await stripe.prices.retrieve(priceId, {
    expand: ['product']
  });
  const product = price.product as Stripe.Product;

  return {
    productName: product.name as string,
    productDescription: product.description || null,
    marketingFeatures: product.marketing_features.map((feature) => feature.name) || null,
    monthOrYear: price.recurring?.interval,
    amount: (price.unit_amount! / 100).toFixed(2),
  };
}

export async function createStripeCustomer({ email, firstName, lastName, user_info_id }: StripeCustomerData): Promise<string | null> {
  try {
    const stripe = getStripe();

    const customerName = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined;

    const customer = await stripe.customers.create({
      email,
      name: customerName,
      metadata: {
        user_info_id: user_info_id,
        source: 'edtack_mvp'
      }
    });

    console.log(`Created Stripe customer ${customer.id} for email ${email}`);
    return customer.id;
  } catch (error) {
    console.error('Failed to create Stripe customer:', error);
    // Don't throw error - we don't want OAuth setup to fail due to Stripe issues
    return null;
  }
}
