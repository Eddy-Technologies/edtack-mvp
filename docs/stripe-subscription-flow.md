# Stripe Subscription Flow

## Overview

This document outlines how Stripe customers and subscriptions are created for each user account in the edtack-mvp codebase.

---

## 1. Customer Creation Entry Points

### Primary: User Registration
**File:** `/server/api/auth/register.post.ts` (Lines 64-69)

```
User submits registration form
    ↓
Supabase Auth signup
    ↓
createStripeCustomer() called
    ↓
RPC: update_user_info_with_relations (stores payment_customer_id)
```

### Secondary: OAuth Onboarding Completion
**File:** `/server/api/auth/complete-onboarding.post.ts` (Lines 73-78)

- Creates Stripe customer if user signed up via OAuth but lacks Stripe setup

---

## 2. Core Stripe Utility

**File:** `/server/utils/stripe.ts` (Lines 46-105)

```typescript
export async function createStripeCustomer({
  email, firstName, lastName, user_info_id
}): Promise<string | null>
```

**Actions:**
1. Calls `stripe.customers.create()` with email, name, metadata
2. Auto-creates free subscription (`EDDY_FREE_MONTHLY`)
3. Returns customer ID (`cus_XXXXX`) or null on failure
4. **Graceful degradation** - failures don't block user creation

---

## 3. Database Schema

### `user_infos` table
**File:** `/supabase/schemas/user_infos.sql`

| Column | Purpose |
|--------|---------|
| `payment_customer_id` | Stores Stripe customer ID (`cus_XXXXX`) |
| `user_id` | Links to Supabase auth.users |

### `user_subscriptions` table
**File:** `/supabase/schemas/user_subscriptions.sql`

| Column | Purpose |
|--------|---------|
| `stripe_subscription_id` | Subscription ID from Stripe |
| `stripe_customer_id` | Denormalized customer ID |
| `tier_lookup_key` | References subscription tier |
| `status` | active, canceled, past_due, etc. |

### `stripe_webhook_events` table
**File:** `/supabase/schemas/stripe_webhook_events.sql`

- Idempotency tracking for webhook events

---

## 4. Webhook Processing

**File:** `/server/api/webhooks/stripe.post.ts`

| Event | Handler |
|-------|---------|
| `customer.created` | Backup - updates `payment_customer_id` if not set |
| `checkout.session.completed` | Handles payments, credits, orders |
| `customer.subscription.created/updated/deleted` | Syncs to `user_subscriptions` table |

**Security:** Webhook signature verification with `NUXT_STRIPE_WEBHOOK_SECRET`

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

User → /api/auth/register.post.ts
              │
              ├─→ 1. supabase.auth.signUp()
              │
              ├─→ 2. createStripeCustomer()
              │        │
              │        ├─→ stripe.customers.create()
              │        │       → email, name, metadata
              │        │
              │        └─→ stripe.subscriptions.create()
              │                → EDDY_FREE_MONTHLY (auto)
              │
              └─→ 3. RPC: update_user_info_with_relations
                         → stores payment_customer_id
                         → creates user_credits record

┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK SYNC FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Stripe → /api/webhooks/stripe.post.ts
              │
              ├─→ Verify signature
              │
              ├─→ Check idempotency (stripe_webhook_events)
              │
              └─→ Handle event type
                     │
                     ├─→ customer.created → backup customer ID sync
                     │
                     ├─→ checkout.session.completed → process payment
                     │
                     └─→ subscription.* → sync user_subscriptions
```

---

## 6. Environment Configuration

**Required Variables:**
```bash
# Server-side
NUXT_STRIPE_SECRET_KEY=sk_...
NUXT_STRIPE_WEBHOOK_SECRET=whsec_...

# Client-side
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NUXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/...
```

---

## 7. Subscription Tiers (Lookup Keys)

**File:** `/shared/constants/stripe.ts`

- `EDDY_FREE_MONTHLY` / `EDDY_FREE_YEARLY`
- `EDDY_PRO_MONTHLY` / `EDDY_PRO_YEARLY`
- `EDDY_MAX_MONTHLY` / `EDDY_MAX_YEARLY`

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `/server/utils/stripe.ts` | Core Stripe utilities |
| `/server/api/auth/register.post.ts` | Primary customer creation |
| `/server/api/auth/complete-onboarding.post.ts` | OAuth customer creation |
| `/server/api/webhooks/stripe.post.ts` | Webhook handler |
| `/server/api/subscription/customer.get.ts` | Get subscription status |
| `/supabase/schemas/user_infos.sql` | User schema with Stripe ID |
| `/supabase/schemas/user_subscriptions.sql` | Subscription tracking |
| `/shared/constants/stripe.ts` | Lookup keys & constants |
| `/app/composables/useStripe.ts` | Frontend Stripe composable |

---

## 9. Error Handling Strategy

- **Registration:** Stripe failures logged but don't block user creation
- **Webhooks:** Idempotent processing with event deduplication
- **Sessions:** Ownership verification via `payment_customer_id` comparison
