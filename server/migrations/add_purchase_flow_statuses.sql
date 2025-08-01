-- Add new order statuses for the two-flow purchase system
INSERT INTO codes (code_type, code_value, display_name, description) VALUES
('order_status', 'pending_parent_approval', 'Pending Parent Approval', 'Order created with credits, waiting for parent to approve and pay'),
('order_status', 'pending_payment', 'Pending Payment', 'Order created, waiting for direct payment via Stripe'),
('order_status', 'parent_approved', 'Parent Approved', 'Parent approved credit purchase and payment completed')
ON CONFLICT (code_type, code_value) DO NOTHING;

-- Add reserved credits field to user_credits table for tracking reserved amounts
ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS reserved_credit INTEGER DEFAULT 0;

-- Add available credit computed column comment (for documentation)
COMMENT ON COLUMN user_credits.credit IS 'Total credit balance in cents';
COMMENT ON COLUMN user_credits.reserved_credit IS 'Credits reserved for pending parent approval orders in cents';

-- Add constraint to ensure reserved credits don't exceed total credits
ALTER TABLE user_credits 
ADD CONSTRAINT chk_reserved_not_exceed_total 
CHECK (reserved_credit <= credit);