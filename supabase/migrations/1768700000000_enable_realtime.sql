-- Enable REPLICA IDENTITY FULL for Supabase Realtime UPDATE events
-- This allows realtime subscriptions to receive the full row data on updates

ALTER TABLE user_credits REPLICA IDENTITY FULL;
ALTER TABLE user_tasks REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE wishlists REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication for realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE user_credits;
ALTER PUBLICATION supabase_realtime ADD TABLE user_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlists;
