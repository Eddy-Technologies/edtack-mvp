import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      });
    }

    // Get user's user_info_id from all_users view
    const { data: userInfo, error: userError } = await supabase
      .from('user_infos')
      .select('id, user_roles(role_id, roles(role_name))')
      .eq('user_id', user.id)
      .single();

    if (userError || !userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    let familyMembers = [];
    const isParent = userInfo.user_roles.some((role) => role.roles.role_name === 'PARENT');

    // Find all the parent_child relationships for this user and their children user_infos and credits and tasks
    const { data: children, error: childrenError } = await supabase
      .from('parent_child')
      .select(`
        child_user_info_id, 
        child:user_infos!child_user_info_id(id, first_name, last_name, is_active, all_users(email), user_credits(credit))
      `)
      .eq('parent_user_info_id', userInfo.id);
    if (isParent) {
      // Format family members
      familyMembers = children?.map((item) => ({
        id: item.child_user_info_id,
        userDisplayFullName: `${item.child.first_name || ''} ${item.child.last_name || ''}`.trim(),
        email: item.child.all_users.email,
        user_role: 'STUDENT', // Children are always child role
        isActive: item.child.is_active,
        credits: item.child.user_credits,
      })) || [];
    } else {
      // Child user - get their parent(s)
      const { data: parents, error: parentsError } = await supabase
        .from('parent_child')
        .select(`
          parent:user_infos!parent_user_info_id(id, first_name, last_name, created_at)
        `)
        .eq('child_user_info_id', userInfo.id);

      if (parentsError) {
        console.error('Failed to fetch parents:', parentsError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch family members'
        });
      }

      // Format family members (parents)
      familyMembers = parents?.map((item) => ({
        id: item.parent.id,
        userDisplayFullName: `${item.parent.first_name || ''} ${item.parent.last_name || ''}`.trim(),
        user_role: 'PARENT', // Parents are always parent role
        isActive: true,
        credits: 0, // Parents don't have credits displayed
        activeTasks: 0
      })) || [];
    }

    return {
      success: true,
      familyMembers: familyMembers,
      isParent: isParent,
    };
  } catch (error) {
    console.error('Failed to fetch family members:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch family members'
    });
  }
});
