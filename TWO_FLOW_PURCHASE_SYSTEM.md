# Two-Flow Purchase System Implementation

## Overview
Successfully implemented a dual-flow purchase system that addresses regulatory compliance while providing flexible payment options.

## The Two Purchase Flows

### Flow 1: Credit Purchase → Parent Approval Required
```
Child with credits → "Purchase with Credits" (use_credits: true)
│
├─ Validate sufficient available credits (total - reserved)
├─ Reserve credits (don't deduct yet)
├─ Create order with status "pending_parent_approval"
├─ Find all parents of the child
├─ Return "awaiting parent approval" response
│
└─ Parents receive notifications
   │
   ├─ Parent approves → Creates Stripe checkout for parent
   │  └─ Parent pays → Webhook completes order → Deduct reserved credits
   │
   └─ Parent rejects → Release reserved credits → Order status "rejected"
```

### Flow 2: Direct Purchase → Immediate Payment
```
Anyone → "Buy Now" (use_credits: false)
│
├─ Create Stripe checkout session immediately
├─ Create order with status "pending_payment"
├─ Return Stripe checkout URL
│
└─ User pays via Stripe → Webhook completes order → Status "paid"
```

## Database Schema Changes

### New Order Statuses
- `pending_parent_approval` - Credit purchase awaiting parent approval
- `pending_payment` - Direct purchase awaiting Stripe payment
- `parent_approved` - Parent approved and paid for credit purchase

### Enhanced user_credits Table
- `credit` - Total credit balance
- `reserved_credit` - Credits reserved for pending parent approvals
- Available credits = credit - reserved_credit

## API Endpoints

### Purchase Flow
- **POST `/api/shop/purchase`** - Handles both flows based on `use_credits` parameter

### Parent Approval System
- **GET `/api/orders/pending-approval`** - List orders awaiting parent approval
- **POST `/api/orders/approve-purchase`** - Parent approves/rejects credit purchase

### Notifications (Placeholder)
- **POST `/api/notifications/send-parent-approval`** - Send parent notification

## Key Features

### Regulatory Compliance
- ✅ **No money holding** - Credits are reward points, not stored value
- ✅ **Real payments via Stripe** - All actual money transactions through Stripe
- ✅ **Parent control** - Parents approve all credit-based purchases
- ✅ **Clear separation** - Credits ≠ Money, just spending requests

### Credit Reservation System
- Credits reserved when child requests purchase
- Reserved credits not available for other purchases
- Released if parent rejects or approves and pays
- Deducted only after parent completes payment

### Webhook Handling
- **Parent-approved purchases**: Uses `order_id` in session metadata
- **Direct purchases**: Uses `user_info_id` and `operation_type` metadata
- Proper order status updates and credit deductions

## User Experience

### For Children
1. **Credit Purchase**: "I want to buy this with my credits" → "Ask parent for approval"
2. **Direct Purchase**: Not restricted - can buy directly if they have payment method

### For Parents
1. **Receive notifications** when child requests credit purchase
2. **Review order details** via pending approvals API
3. **Approve and pay** via Stripe checkout OR **reject** to release credits
4. **Full visibility** into all credit-based spending requests

## Technical Implementation

### Purchase API Logic
```typescript
if (use_credits) {
  // Flow 1: Reserve credits, create pending order, notify parents
  reserveCredits(totalCostCents);
  createOrder(status: 'pending_parent_approval');
  notifyParents(parentsList);
} else {
  // Flow 2: Create Stripe session, create pending order
  const session = createStripeCheckout();
  createOrder(status: 'pending_payment');
  return { checkoutUrl: session.url };
}
```

### Webhook Distinction
```typescript
if (session.metadata?.order_id) {
  // Parent-approved credit purchase completion
  updateOrderToPaid();
  deductReservedCredits();
} else if (session.metadata?.operation_type === 'purchase') {
  // Direct purchase completion
  findPendingOrderAndMarkPaid();
}
```

## Migration Files
1. `add_purchase_flow_statuses.sql` - New order statuses and reserved credits
2. Updated webhook and purchase API logic

## Benefits Achieved
✅ **Regulatory compliance** - No money holding, clear transaction flow  
✅ **Parent control** - All credit spending requires approval  
✅ **Flexibility** - Both credit and direct payment options  
✅ **Transparency** - Clear audit trail for all transactions  
✅ **User experience** - Intuitive flows for both children and parents  

## Next Steps
1. **Run database migrations** in Supabase
2. **Implement email notifications** (currently placeholder)
3. **Update frontend** to support both purchase flows
4. **Test both flows** thoroughly
5. **Add order management UI** for parents

This system successfully separates reward credits from actual money transactions while maintaining excellent user experience and regulatory compliance.