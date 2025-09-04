import { getSupabaseClient } from '#imports';
import type { Database } from '~~/types/supabase';

export interface GetChatThreadRes {

  created_at: string | null;
  id: string;
  subject: string | null;
  title: string | null;
  updated_at: string | null;
  user_infos_id: string;
  thread_messages: {
    content: string;
    created_at: string | null;
    id: string;
    sender: string | null;
    thread_id: string;
    type: string;
  }[];
  task_threads: {
    created_at: string | null;
    due_date: string;
    generated_content: any | null;
    id: string;
    init_prompt: any | null;
    status: string;
    thread_id: string;
    user_task_id: string;
  } | null;
};

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const id = getRouterParam(event, 'threadId');

    // Fetch thread data
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('*, thread_messages(*), task_threads(*)')
      .eq('id', id)
      .single();

    if (threadError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch thread: ${threadError.message}`,
      });
    }

    if (threadData?.thread_messages) {
      threadData.thread_messages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return {
      success: true,
      threadData: threadData as GetChatThreadRes,
    };
  } catch (err: any) {
    console.error('Fetch messages API error:', err);
    if (err.statusCode) throw err;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch messages' });
  }
});
