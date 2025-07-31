-- 2. Insert order status constants
INSERT INTO codes (code, name, description, category, sort_order) VALUES
-- Order Status Constants
('pending', 'Payment Pending', 'Order created but payment not yet processed', 'order_status', 10),
('paid', 'Payment Successful', 'Payment completed successfully', 'order_status', 20),
('confirmed', 'Order Confirmed', 'Order confirmed and sent to external fulfillment', 'order_status', 30),
('cancelled', 'Cancelled', 'Order has been cancelled', 'order_status', 40),
('refunded', 'Refunded', 'Refund has been completed', 'order_status', 50),

-- Operation Type Constants  
('credit_topup', 'Credit Top-up', 'Customer credit balance top-up transaction', 'operation_type', 10),
('transfer_out', 'Transfer Out', 'Credits transferred out to another account', 'operation_type', 20),
('transfer_in', 'Transfer In', 'Credits received from another account', 'operation_type', 30),
('balance_adjustment', 'Balance Adjustment', 'Manual balance adjustment by administrator', 'operation_type', 40),
('purchase', 'Purchase', 'Product purchase using customer credit balance', 'operation_type', 50);
