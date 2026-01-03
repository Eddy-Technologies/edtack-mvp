import Stripe from 'stripe';
import { STRIPE_LOOKUP_KEYS } from '~~/shared/constants';

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
    return null;
  }
}

// Create free subscription - call AFTER payment_customer_id is saved to DB
export async function createFreeSubscription(customerId: string, userInfoId: string): Promise<string | null> {
  try {
    const stripe = getStripe();

    const prices = await stripe.prices.list({
      lookup_keys: [STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY],
      expand: ['data.product']
    });

    if (prices.data.length === 0) {
      console.warn(`Free monthly price with lookup key ${STRIPE_LOOKUP_KEYS.EDDY_FREE_MONTHLY} not found`);
      return null;
    }

    const freePrice = prices.data[0];
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: freePrice.id }],
      metadata: {
        user_info_id: userInfoId,
        plan_type: 'free',
        auto_created: 'true'
      }
    });

    console.log(`Created free subscription ${subscription.id} for customer ${customerId}`);
    return subscription.id;
  } catch (error) {
    console.error('Failed to create free subscription:', error);
    return null;
  }
}
