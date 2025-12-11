import { requireAdmin } from '~~/server/utils/auth';

/**
 * Admin endpoint to backfill user_subscriptions table from Stripe
 * One-time migration to sync existing subscriptions
 */
export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdmin(event);

    const stripe = getStripe();
    const supabase = await getPrivilegedSupabaseClient(event);

    // Get all users with payment_customer_id
    const { data: users, error: usersError } = await supabase
      .from('user_infos')
      .select('id, email, payment_customer_id')
      .not('payment_customer_id', 'is', null);

    if (usersError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch users'
      });
    }

    console.log(`[SyncSubscriptions] Found ${users.length} users with Stripe customers`);

    const results = {
      total: users.length,
      synced: 0,
      skipped: 0,
      errors: [] as Array<{ userId: string; email: string; error: string }>
    };

    // Process each user
    for (const user of users) {
      try {
        // Fetch active subscription from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.payment_customer_id,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length === 0) {
          console.log(`[SyncSubscriptions] No active subscription for user ${user.email}`);
          results.skipped++;
          continue;
        }

        const subscription = subscriptions.data[0];

        // Get lookup_key from the price
        const priceId = subscription.items.data[0]?.price?.id;
        if (!priceId) {
          results.skipped++;
          continue;
        }

        const price = await stripe.prices.retrieve(priceId);
        const lookupKey = price.lookup_key;

        if (!lookupKey) {
          console.warn(`[SyncSubscriptions] No lookup_key for user ${user.email}`);
          results.skipped++;
          continue;
        }

        // Insert subscription data
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_info_id: user.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            tier_lookup_key: lookupKey,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            billing_interval: price.recurring?.interval || 'month',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'stripe_subscription_id'
          });

        if (insertError) {
          results.errors.push({
            userId: user.id,
            email: user.email,
            error: insertError.message
          });
        } else {
          console.log(`[SyncSubscriptions] Synced subscription for user ${user.email}`);
          results.synced++;
        }
      } catch (error: any) {
        results.errors.push({
          userId: user.id,
          email: user.email,
          error: error.message || 'Unknown error'
        });
      }
    }

    console.log(`[SyncSubscriptions] Completed: ${results.synced} synced, ${results.skipped} skipped, ${results.errors.length} errors`);

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('[SyncSubscriptions] Migration failed:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Subscription migration failed'
    });
  }
});
