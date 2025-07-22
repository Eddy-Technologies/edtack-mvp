# Stripe Subscription Setup Guide

This guide will help you set up the complete Stripe subscription integration for your EdTack platform.

## Prerequisites

1. A Stripe account (test or live)
2. Supabase project with the new subscription schema
3. Ngrok or similar tool for webhook testing (development only)

## 1. Database Setup

First, run the subscription schema in your Supabase SQL editor:

```bash
# Execute the database schema
cat database/subscription-schema.sql
```

This creates:
- `subscription_plans` - Available subscription plans
- `user_subscriptions` - User's active subscriptions
- `payment_transactions` - Payment history
- `stripe_webhook_events` - Webhook event tracking

## 2. Stripe Configuration

### 2.1 Get Your Stripe Keys

1. Log into your Stripe Dashboard
2. Navigate to Developers > API keys
3. Copy your **Publishable key** and **Secret key**

### 2.2 Set Up Products and Prices

Option A: Let the system auto-create (recommended):
- The system will automatically create Stripe products and prices when first used

Option B: Manual setup in Stripe Dashboard:
1. Create a Product called "Premium Plan"
2. Create recurring prices:
   - Monthly: SGD 29.00
   - Yearly: SGD 290.00
3. Note the price IDs for configuration

### 2.3 Configure Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

For local development:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 3. Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
NUXT_STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key  
NUXT_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
NUXT_PUBLIC_BASE_URL=http://localhost:3000
```

For production, replace `sk_test_` and `pk_test_` with your live keys.

## 4. Testing the Integration

### 4.1 Test Subscription Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/subscription` page
3. Select a plan and proceed to checkout
4. Use Stripe test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
   - 3D Secure: `4000002500003155`

### 4.2 Test Webhooks

1. Complete a test subscription
2. Check your database for:
   - New record in `user_subscriptions`
   - Payment record in `payment_transactions`
   - Webhook events in `stripe_webhook_events`

## 5. Customer Portal Setup

Stripe's Customer Portal is automatically configured for:
- Payment method updates
- Subscription cancellation
- Invoice downloads
- Billing history

Access via the "Manage Billing" button in the dashboard.

## 6. Production Deployment

### 6.1 Update Environment Variables

Replace test keys with live Stripe keys:
```bash
NUXT_STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NUXT_PUBLIC_BASE_URL=https://your-production-domain.com
```

### 6.2 Webhook Configuration

Update webhook endpoint to your production URL:
`https://your-production-domain.com/api/stripe/webhook`

## 7. Monitoring and Analytics

### 7.1 Stripe Dashboard

Monitor:
- Subscription metrics
- Payment success rates
- Customer churn
- Revenue trends

### 7.2 Database Queries

Track subscription health:
```sql
-- Active subscriptions
SELECT COUNT(*) as active_subscriptions 
FROM user_subscriptions 
WHERE status = 'active';

-- Monthly recurring revenue
SELECT SUM(sp.price_sgd) as mrr
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active' AND sp.interval_type = 'month';

-- Trial conversion rate
SELECT 
  COUNT(CASE WHEN trial_end IS NOT NULL THEN 1 END) as trials,
  COUNT(CASE WHEN status = 'active' AND trial_end < NOW() THEN 1 END) as converted
FROM user_subscriptions;
```

## 8. Feature Access Control

Use the subscription status to control feature access:

```typescript
// In your components
const { isPremium, isActive } = useSubscription();

// Conditional rendering
<div v-if="isPremium">
  <!-- Premium features -->
</div>

// API middleware
if (!subscription.isPremium) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Premium subscription required'
  });
}
```

## 9. Troubleshooting

### Common Issues

1. **Webhooks not working**:
   - Check webhook URL is accessible
   - Verify webhook signing secret
   - Check server logs for errors

2. **Subscription not updating**:
   - Verify webhook events are being processed
   - Check `stripe_webhook_events` table for failures
   - Ensure database permissions are correct

3. **Payment failures**:
   - Check Stripe Dashboard for detailed error messages
   - Verify customer payment methods
   - Review failed payment webhooks

### Debug Commands

```bash
# Check webhook events
SELECT * FROM stripe_webhook_events WHERE processed = false;

# Check subscription status
SELECT us.*, sp.display_name 
FROM user_subscriptions us 
JOIN subscription_plans sp ON us.plan_id = sp.id 
WHERE us.user_info_id = 'user-id';

# Test webhook locally
stripe events resend evt_test_webhook_id
```

## 10. Security Considerations

- Never expose secret keys in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Implement proper user authentication
- Log security events for monitoring

## Support

For issues:
1. Check Stripe Dashboard logs
2. Review server logs
3. Check Supabase database records
4. Test with Stripe CLI tools

This integration provides a complete subscription management system with minimal custom code required!