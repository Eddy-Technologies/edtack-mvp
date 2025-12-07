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
  'subscription_tier_limits.sql', // Token limits for subscription tiers
  'subjects.sql',
  'chapters.sql',
  'curriculum_subjects.sql',
  'user_infos.sql',
  'user_roles.sql',
  'user_credits.sql',
  'user_subscriptions.sql', // User subscription sync from Stripe
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
  'token_usage_summary.sql', // Pre-aggregated token usage for fast queries
  'stripe_webhook_events.sql',
  'checkpointer_tables.sql',
  'threads.sql',
  'thread_messages.sql',
  'message_feedback.sql',
  'user_tasks_chapters.sql',
  'user_tasks_chapters_questions.sql'
];

// Function files to include (in order)
export const functionFiles = [
  'transfer_credits_atomic.sql',
  'token_rollup.sql'
];

// Seed files to include (in order)
export const seedFiles = [
  'all_seeds.sql',
  'education_data.sql',
  'characters.sql'
];

// Cron job files to include (in order)
export const cronFiles = [
  'token_rollup.sql'
];
