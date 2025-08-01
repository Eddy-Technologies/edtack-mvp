import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const body = await readBody(event);
    
    const { 
      child_user_info_id, 
      name, 
      subtitle, 
      description, 
      credit, 
      due_date,
      priority,
      category 
    } = body;

    // Validate required fields
    if (!child_user_info_id || !name || credit === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'child_user_info_id, name, and credit are required'
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

    // Get parent's user_info_id
    const { data: parentInfo, error: parentError } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Parent user info not found'
      });
    }

    // Verify that the child belongs to this parent
    const { data: parentChildRelation, error: relationError } = await supabase
      .from('parent_child')
      .select('id')
      .eq('parent_user_info_id', parentInfo.id)
      .eq('child_user_info_id', child_user_info_id)
      .single();

    if (relationError || !parentChildRelation) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create tasks for your children'
      });
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('task_credit')
      .insert({
        parent_user_info_id: parentInfo.id,
        child_user_info_id,
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