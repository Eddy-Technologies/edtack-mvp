/**
 * Recurring Tasks Management System
 *
 * This system manages task threads for recurring tasks using a sophisticated approach:
 *
 * ARCHITECTURE OVERVIEW:
 * - user_tasks: Master task definitions (templates)
 * - task_threads: Individual task instances that users actually work on
 * - threads: Generated conversations for each task thread
 * - thread_messages: Individual prompts and responses in conversations
 *
 * WORKFLOW:
 * 1. When a task is created, an initial task_thread is generated immediately
 * 2. Daily cron job checks for tasks that need new threads based on recurrence_frequency
 * 3. For each eligible task, new task_threads are created with appropriate due dates
 * 4. Each task_thread gets its own chat_thread with initial prompt and generated content
 * 5. Expired/overdue threads are marked as 'expired' to maintain data integrity
 *
 * RECURRENCE LOGIC:
 * - ONE_OFF: Single task thread, no recurrence
 * - DAILY: New thread created every day
 * - WEEKLY: New thread created every Sunday
 * - MONTHLY: New thread created on 1st of each month
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { TASK_STATUS, TASK_THREAD_STATUS, RECURRENCE_FREQUENCY } from '~~/shared/constants';
import type { Database } from '~~/types/supabase';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('Recurring tasks system initialized');

  // Schedule cron job to run every day at midnight (or every hour for testing)
  // In production, this should run once daily at a consistent time
  setInterval(async () => {
    console.log('Running recurring tasks cron job at', new Date().toISOString());
    await processRecurringTasks();
  }, 60 * 60 * 1000); // Run every hour (change to daily in production)
});

/**
 * Main function that processes all recurring tasks
 * This function:
 * 1. Finds expired task threads and marks them as expired
 * 2. Identifies tasks that need new threads based on recurrence frequency
 * 3. Creates new task threads with generated content
 */
async function processRecurringTasks() {
  try {
    const config = useRuntimeConfig();
    const supabase: SupabaseClient<Database> = createClient(
      config.private.supabaseUrl,
      config.private.supabaseServiceRoleKey
    );

    console.log('Starting recurring tasks processing...');

    // Step 1: Expire overdue task threads
    await expireOverdueThreads(supabase);

    // Step 2: Create new task threads for recurring tasks
    await createNewTaskThreads(supabase);

    console.log('Recurring tasks processing completed successfully');
  } catch (error) {
    console.error('Fatal error in recurring tasks processing:', error);
  }
}

/**
 * Marks overdue task threads as expired
 * This maintains data integrity and provides clear status tracking
 */
async function expireOverdueThreads(supabase: SupabaseClient<Database>) {
  const now = new Date();

  try {
    // Find all open task threads that are past their due date
    const { data: overdueThreads, error: fetchError } = await supabase
      .from('task_threads')
      .select('id, due_date, user_task_id')
      .eq('status', TASK_THREAD_STATUS.OPEN)
      .lt('due_date', now.toISOString());

    if (fetchError) {
      console.error('Failed to fetch overdue threads:', fetchError);
      return;
    }

    if (!overdueThreads || overdueThreads.length === 0) {
      console.log('No overdue task threads found');
      return;
    }

    console.log(`Found ${overdueThreads.length} overdue task threads to expire`);

    // Mark all overdue threads as expired
    const expiredIds = overdueThreads.map((thread) => thread.id);
    const { error: updateError } = await supabase
      .from('task_threads')
      .update({ status: TASK_THREAD_STATUS.EXPIRED })
      .in('id', expiredIds);

    if (updateError) {
      console.error('Failed to expire overdue threads:', updateError);
      return;
    }

    console.log(`Successfully expired ${expiredIds.length} overdue task threads`);
  } catch (error) {
    console.error('Error in expireOverdueThreads:', error);
  }
}

/**
 * Creates new task threads for recurring tasks based on their frequency
 * This is the core logic that determines when new task instances should be generated
 */
async function createNewTaskThreads(supabase: SupabaseClient<Database>) {
  try {
    // Find all active recurring tasks
    const { data: recurringTasks, error: fetchError } = await supabase
      .from('user_tasks')
      .select(`
        id,
        creator_user_info_id,
        assignee_user_info_id,
        name,
        subject,
        lesson_generation_type,
        credit,
        questions_per_quiz,
        required_score,
        recurrence_frequency,
      `)
      .eq('status', TASK_STATUS.OPEN)
      .neq('recurrence_frequency', RECURRENCE_FREQUENCY.ONE_OFF);

    if (fetchError) {
      console.error('Failed to fetch recurring tasks:', fetchError);
      return;
    }

    if (!recurringTasks || recurringTasks.length === 0) {
      console.log('No active recurring tasks found');
      return;
    }

    console.log(`Processing ${recurringTasks.length} recurring tasks`);

    // Process each recurring task
    for (const task of recurringTasks) {
      await processIndividualRecurringTask(supabase, task);
    }
  } catch (error) {
    console.error('Error in createNewTaskThreads:', error);
  }
}

/**
 * Processes an individual recurring task to determine if new threads should be created
 * This function implements the business logic for different recurrence frequencies
 */
async function processIndividualRecurringTask(supabase: SupabaseClient<Database>, task: any) {
  try {
    const now = new Date();
    const shouldCreateNewThread = await shouldCreateNewTaskThread(supabase, task, now);

    if (shouldCreateNewThread) {
      const nextDueDate = calculateNextDueDate(task.recurrence_frequency);
      await createTaskThread(supabase, task, nextDueDate);
      console.log(`Created new task thread for task "${task.name}" due ${nextDueDate.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error processing recurring task ${task.id}:`, error);
  }
}

/**
 * Determines if a new task thread should be created for a recurring task
 * Business rules:
 * - DAILY: Create if no open thread exists for today
 * - WEEKLY: Create on Sunday if no open thread exists for this week
 * - MONTHLY: Create on 1st if no open thread exists for this month
 */
async function shouldCreateNewTaskThread(
  supabase: SupabaseClient<Database>,
  task: any,
  now: Date
): Promise<boolean> {
  // Check if there's already an open thread for the current period
  const currentPeriodStart = getPeriodStart(task.recurrence_frequency, now);
  const currentPeriodEnd = getPeriodEnd(task.recurrence_frequency, now);

  const { data: existingThreads, error } = await supabase
    .from('task_threads')
    .select('id, status, due_date')
    .eq('user_task_id', task.id)
    .eq('status', TASK_THREAD_STATUS.OPEN)
    .gte('due_date', currentPeriodStart.toISOString())
    .lte('due_date', currentPeriodEnd.toISOString());

  if (error) {
    console.error('Error checking existing threads:', error);
    return false;
  }

  // If there's already an open thread for this period, don't create a new one
  if (existingThreads && existingThreads.length > 0) {
    return false;
  }

  // Additional frequency-specific logic
  switch (task.recurrence_frequency) {
    case RECURRENCE_FREQUENCY.DAILY:
      // Create daily thread if none exists for today
      return true;

    case RECURRENCE_FREQUENCY.WEEKLY:
      // Create weekly thread only on Sundays
      return now.getDay() === 0; // Sunday

    case RECURRENCE_FREQUENCY.MONTHLY:
      // Create monthly thread only on the 1st
      return now.getDate() === 1;

    default:
      return false;
  }
}

/**
 * Creates a new task thread with associated chat thread and messages
 * This function handles the complete creation workflow including content generation
 */
async function createTaskThread(
  supabase: SupabaseClient<Database>,
  task: any,
  dueDate: Date
) {
  try {
    // Step 1: Create chat thread for this task thread
    const { data: chatThread, error: chatThreadError } = await supabase
      .from('threads')
      .insert({
        user_infos_id: task.assignee_user_info_id,
        title: `${task.name} - ${dueDate.toDateString()}`
      })
      .select('id')
      .single();

    if (chatThreadError || !chatThread) {
      console.error('Failed to create chat thread:', chatThreadError);
      throw new Error('Chat thread creation failed');
    }

    // Step 2: Prepare initial prompt for content generation
    const initPrompt = {
      subject: task.subject,
      lesson_generation_type: task.lesson_generation_type,
      questions_per_quiz: task.questions_per_quiz,
      required_score: task.required_score,
      credit_reward: task.credit,
      task_name: task.name,
      due_date: dueDate.toISOString(),
      timestamp: new Date().toISOString()
    };

    // Step 3: Generate content (placeholder for now)
    const generatedContent = await generateTaskContent(initPrompt);

    // Step 4: Create the task thread record
    const { data: taskThread, error: taskThreadError } = await supabase
      .from('task_threads')
      .insert({
        user_task_id: task.id,
        thread_id: chatThread.id,
        due_date: dueDate.toISOString(),
        init_prompt: initPrompt,
        generated_content: generatedContent,
        status: TASK_THREAD_STATUS.OPEN
      })
      .select('id')
      .single();

    if (taskThreadError || !taskThread) {
      console.error('Failed to create task thread:', taskThreadError);
      throw new Error('Task thread creation failed');
    }

    // Step 5: Create chat messages for the conversation
    await createChatMessages(supabase, chatThread.id, initPrompt, generatedContent);

    console.log(`Successfully created task thread ${taskThread.id} for task ${task.name}`);
  } catch (error) {
    console.error('Error in createTaskThread:', error);
    throw error;
  }
}

/**
 * Creates initial chat messages for the task thread conversation
 * Creates two messages: one for the initial prompt, one for the generated content
 */
async function createChatMessages(
  supabase: SupabaseClient<Database>,
  chatThreadId: string,
  initPrompt: any,
  generatedContent: any
) {
  try {
    // Create initial prompt message
    const { error: promptMessageError } = await supabase
      .from('thread_messages')
      .insert({
        thread_id: chatThreadId,
        sender: null, // System message
        type: 'system_prompt',
        content: JSON.stringify(initPrompt)
      });

    if (promptMessageError) {
      console.error('Failed to create prompt message:', promptMessageError);
    }

    // Create generated content message
    const { error: contentMessageError } = await supabase
      .from('thread_messages')
      .insert({
        thread_id: chatThreadId,
        sender: null, // System message
        type: 'generated_content',
        content: JSON.stringify(generatedContent)
      });

    if (contentMessageError) {
      console.error('Failed to create content message:', contentMessageError);
    }
  } catch (error) {
    console.error('Error creating chat messages:', error);
  }
}

/**
 * Placeholder function for content generation API call
 * In production, this would call the actual AI/content generation service
 */
async function generateTaskContent(initPrompt: any): Promise<any> {
  // TODO: Replace with actual API call to content generation service

  // Simulate content generation with placeholder data
  const placeholderContent = {
    quiz_id: `quiz_${Date.now()}`,
    questions: Array.from({ length: initPrompt.questions_per_quiz }, (_, i) => ({
      id: `q_${i + 1}`,
      question: `Sample question ${i + 1} for ${initPrompt.subject}`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option A',
      explanation: `This is the explanation for question ${i + 1}`
    })),
    metadata: {
      subject: initPrompt.subject,
      difficulty: 'grade_appropriate',
      estimated_duration: '15 minutes',
      generated_at: new Date().toISOString()
    }
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('Generated placeholder content for task:', initPrompt.task_name);
  return placeholderContent;
}

/**
 * Calculates the next due date based on recurrence frequency
 * Each frequency has specific business rules for due date calculation
 */
function calculateNextDueDate(frequency: string): Date {
  const now = new Date();

  switch (frequency) {
    case RECURRENCE_FREQUENCY.DAILY: {
      // Daily tasks are due at the end of the current day
      const dailyDue = new Date(now);
      dailyDue.setHours(23, 59, 59, 999);
      return dailyDue;
    }

    case RECURRENCE_FREQUENCY.WEEKLY: {
      // Weekly tasks are due at the end of Sunday (today if today is Sunday)
      const weeklyDue = new Date(now);
      const daysUntilSunday = 7 - weeklyDue.getDay();
      if (daysUntilSunday === 7) {
        // Today is Sunday, due today
        weeklyDue.setHours(23, 59, 59, 999);
      } else {
        // Due next Sunday
        weeklyDue.setDate(weeklyDue.getDate() + daysUntilSunday);
        weeklyDue.setHours(23, 59, 59, 999);
      }
      return weeklyDue;
    }

    case RECURRENCE_FREQUENCY.MONTHLY: {
      // Monthly tasks are due at the end of the current month
      const monthlyDue = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthlyDue.setHours(23, 59, 59, 999);
      return monthlyDue;
    }

    default:
      throw new Error(`Invalid recurrence frequency: ${frequency}`);
  }
}

/**
 * Helper function to get the start of the current period for a frequency
 */
function getPeriodStart(frequency: string, date: Date): Date {
  const periodStart = new Date(date);

  switch (frequency) {
    case RECURRENCE_FREQUENCY.DAILY: {
      periodStart.setHours(0, 0, 0, 0);
      return periodStart;
    }

    case RECURRENCE_FREQUENCY.WEEKLY: {
      // Start of week is Sunday
      const dayOfWeek = periodStart.getDay();
      periodStart.setDate(periodStart.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);
      return periodStart;
    }

    case RECURRENCE_FREQUENCY.MONTHLY: {
      // Start of month is 1st
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      return periodStart;
    }

    default:
      return periodStart;
  }
}

/**
 * Helper function to get the end of the current period for a frequency
 */
function getPeriodEnd(frequency: string, date: Date): Date {
  const periodEnd = new Date(date);

  switch (frequency) {
    case RECURRENCE_FREQUENCY.DAILY: {
      periodEnd.setHours(23, 59, 59, 999);
      return periodEnd;
    }

    case RECURRENCE_FREQUENCY.WEEKLY: {
      // End of week is Saturday
      const dayOfWeek = periodEnd.getDay();
      periodEnd.setDate(periodEnd.getDate() + (6 - dayOfWeek));
      periodEnd.setHours(23, 59, 59, 999);
      return periodEnd;
    }

    case RECURRENCE_FREQUENCY.MONTHLY: {
      // End of month is last day
      const lastDay = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0);
      lastDay.setHours(23, 59, 59, 999);
      return lastDay;
    }

    default:
      return periodEnd;
  }
}
