import Stripe from 'stripe';
import { STRIPE_SUBSCRIPTION_LOOKUP_KEY } from '~~/utils/stripe';

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

    // Create customer
    const customer = await stripe.customers.create({
      email,
      name: customerName,
      metadata: {
        user_info_id: user_info_id,
        source: 'edtack_mvp'
      }
    });

    console.log(`Created Stripe customer ${customer.id} for email ${email}`);

    // Create free subscription for the customer
    try {
      // Get the free monthly price using lookup key
      const prices = await stripe.prices.list({
        lookup_keys: [STRIPE_SUBSCRIPTION_LOOKUP_KEY.EDDY_FREE_MONTHLY],
        expand: ['data.product']
      });

      if (prices.data.length > 0) {
        const freePrice = prices.data[0];

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price: freePrice.id,
            },
          ],
          metadata: {
            user_info_id: user_info_id,
            plan_type: 'free',
            auto_created: 'true'
          }
        });

        console.log(`Created free subscription ${subscription.id} for customer ${customer.id}`);
      } else {
        console.warn(`Free monthly price with lookup key ${STRIPE_SUBSCRIPTION_LOOKUP_KEY.EDDY_FREE_MONTHLY} not found`);
      }
    } catch (subscriptionError) {
      console.error('Failed to create free subscription for customer:', subscriptionError);
      // Don't fail customer creation if subscription fails
      // Customer can be created manually later or during onboarding
    }

    return customer.id;
  } catch (error) {
    console.error('Failed to create Stripe customer:', error);
    // Don't throw error - we don't want user creation to fail due to Stripe issues
    return null;
  }
}
