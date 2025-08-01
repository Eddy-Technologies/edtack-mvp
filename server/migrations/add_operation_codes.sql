-- Add new operation type codes for the internal credit system
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('task_reward', 'Task Reward', 'Credits awarded for completing a task', 'operation_type', 10),
('internal_transfer_in', 'Internal Transfer In', 'Internal credit transfer received', 'operation_type', 20),
('internal_transfer_out', 'Internal Transfer Out', 'Internal credit transfer sent', 'operation_type', 30),
('internal_purchase', 'Internal Purchase', 'Purchase made with internal credits', 'operation_type', 40)
ON CONFLICT (code) DO NOTHING;

-- Add task status codes
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('task_pending', 'Pending', 'Task has been created and is waiting to be started', 'task_status', 10),
('task_in_progress', 'In Progress', 'Task is currently being worked on', 'task_status', 20),
('task_completed', 'Completed', 'Task has been completed by child, awaiting parent approval', 'task_status', 30),
('task_approved', 'Approved', 'Task has been approved by parent and credits awarded', 'task_status', 40),
('task_rejected', 'Rejected', 'Task completion was rejected by parent', 'task_status', 50),
('task_cancelled', 'Cancelled', 'Task was cancelled', 'task_status', 60),
('task_expired', 'Expired', 'Task has passed its due date without completion', 'task_status', 70)
ON CONFLICT (code) DO NOTHING;

-- Add task priority codes
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('priority_low', 'Low Priority', 'Low priority task', 'task_priority', 10),
('priority_medium', 'Medium Priority', 'Medium priority task', 'task_priority', 20),
('priority_high', 'High Priority', 'High priority task', 'task_priority', 30)
ON CONFLICT (code) DO NOTHING;