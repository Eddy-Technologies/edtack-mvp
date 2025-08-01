import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);

    const {
      assignee_user_info_id,
      name,
      subtitle,
      description,
      credit,
      due_date,
      priority,
      category
    } = body;

    // Validate required fields
    if (!assignee_user_info_id || !name || credit === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'assignee_user_info_id, name, and credit are required'
      });
    }

    // Get authenticated user (parent)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get creator's user_info_id
    const { data: creatorInfo, error: creatorError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (creatorError || !creatorInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Creator user info not found'
      });
    }

    // Verify that the assignee belongs to this creator (parent-child relationship)
    const { data: parentChildRelation, error: relationError } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', creatorInfo.id)
      .eq('child_user_info_id', assignee_user_info_id)
      .single();

    if (relationError || !parentChildRelation) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create tasks for your children'
      });
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .insert({
        creator_user_info_id: creatorInfo.id,
        assignee_user_info_id,
        name,
        subtitle: subtitle || null,
        description: description || null,
        credit: parseInt(credit),
        status: 'pending',
        due_date: due_date ? new Date(due_date).toISOString() : null,
        priority: priority || 'medium',
        category: category || null
      })
      .select(`
        id,
        name,
        subtitle,
        description,
        credit,
        status,
        due_date,
        priority,
        category,
        created_at,
        updated_at
      `)
      .single();

    if (taskError) {
      console.error('Failed to create task:', taskError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create task'
      });
    }

    return {
      success: true,
      task: {
        ...task,
        creditInDollars: (task.credit / 100).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Failed to create task:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create task'
    });
  }
});
