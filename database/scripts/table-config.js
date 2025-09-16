/**
 * Shared configuration for database table ordering
 * This ensures consistency across all database scripts
 */

// Define table creation order (dependencies)
export const orderedTableFiles = [
  'roles.sql',
  'level_types.sql',
  'syllabus_types.sql',
  'codes.sql',
  'subjects.sql',
  'chapters.sql',
  'curriculum_subjects.sql',
  'user_infos.sql',
  'user_roles.sql',
  'user_credits.sql',
  'groups.sql',
  'group_members.sql',
  'syllabus.sql',
  'questions.sql',
  'question_options.sql',
  'question_correct_answers.sql',
  'user_question_attempts.sql',
  'user_question_answers.sql',
  'products.sql',
  'orders.sql',
  'order_items.sql',
  'wishlists.sql',
  'user_tasks.sql',
  'credit_transactions.sql',
  'characters.sql',
  // 'notes.sql',
  'token_history.sql',
  'stripe_webhook_events.sql',
  'checkpointer_tables.sql',
  'functions.sql',
  'threads.sql',
  'thread_messages.sql',
  'task_threads.sql',
  'message_feedback.sql',
  'user_tasks_chapters.sql'
];

// Seed files to include (in order)
export const seedFiles = [
  'all_seeds.sql',
  'education_data.sql',
  'characters.sql'
];
