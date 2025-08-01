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

    // Get user's info
    const { data: userInfo } = await supabase
      .from('user_infos')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userInfo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User info not found'
      });
    }

    // Get user's internal credit balance
    let { data: userCredits } = await supabase
      .from('user_credits')
      .select('credit, updated_at')
      .eq('user_info_id', userInfo.id)
      .single();

    // If no credit record exists, create one
    if (!userCredits) {
      const { data: newCredit, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_info_id: userInfo.id,
          credit: 0
        })
        .select('credit, updated_at')
        .single();

      if (insertError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to initialize credit balance'
        });
      }
      userCredits = newCredit;
    }

    // Check if user has children (is a parent)
    const { data: parentWithChildren } = await supabase
      .from('user_infos')
      .select(`
        id, 
        parent_child!parent_child_parent_user_info_id_fkey(
          child_user_info_id,
          all_users!parent_child_child_user_info_id_fkey(email, first_name, last_name)
        )
      `)
      .eq('user_id', user.id)
      .single();

    const hasChildren = parentWithChildren?.parent_child && parentWithChildren.parent_child.length > 0;

    if (hasChildren) {
      // Get children's credit balances
      const childUserInfoIds = parentWithChildren.parent_child.map((child) => child.child_user_info_id);

      const { data: childrenCredits } = await supabase
        .from('user_credits')
        .select('user_info_id, credit, updated_at')
        .in('user_info_id', childUserInfoIds);

      const childrenData = await Promise.all(parentWithChildren.parent_child.map(async (child) => {
        const childCredit = childrenCredits?.find((c) => c.user_info_id === child.child_user_info_id);

        // If child doesn't have credit record, create one
        if (!childCredit) {
          const { data: newChildCredit } = await supabase
            .from('user_credits')
            .insert({
              user_info_id: child.child_user_info_id,
              credit: 0
            })
            .select('credit, updated_at')
            .single();

          return {
            userInfoId: child.child_user_info_id,
            email: child.all_users.email,
            firstName: child.all_users.first_name,
            lastName: child.all_users.last_name,
            balance: 0,
            currency: 'SGD',
            updatedAt: newChildCredit?.updated_at
          };
        }

        return {
          userInfoId: child.child_user_info_id,
          email: child.all_users.email,
          firstName: child.all_users.first_name,
          lastName: child.all_users.last_name,
          balance: childCredit.credit,
          currency: 'SGD',
          updatedAt: childCredit.updated_at
        };
      }));

      return {
        user: {
          email: user.email,
          balance: userCredits.credit,
          currency: 'SGD',
          updatedAt: userCredits.updated_at
        },
        children: childrenData,
        fetchedAt: new Date().toISOString()
      };
    } else {
      return {
        user: {
          email: user.email,
          balance: userCredits.credit,
          currency: 'SGD',
          updatedAt: userCredits.updated_at
        },
        fetchedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Failed to get unified credit data:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve credit data'
    });
  }
});
