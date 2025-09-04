import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAuth } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    // Get authenticated user
    const user = await requireAuth(event);

    // Get user's info and role
    const { data: userInfo } = await supabase
      .from('user_infos')
      .select(`
        id,
        user_roles!inner(
          roles!inner(
            role_name
          )
        )
      `)
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

    // Check if user is a parent by role
    const isParent = userInfo.user_roles?.some((userRole) =>
      userRole.roles.role_name === 'PARENT'
    );

    let hasChildren = false;
    let childrenData = [];

    if (isParent) {
      // Get children data from family groups (consistent with family list API)
      const { data: userGroups, error: groupsError } = await supabase
        .from('group_members')
        .select(`*, 
          groups(group_type, 
          members:group_members!group_id(*,
            user_infos!group_members_user_info_id_fkey(*, user_roles(*, roles(role_name)), user_credits(*))))`)
        .eq('user_info_id', userInfo.id)
        .eq('status', 'active');

      if (groupsError) {
        console.error('Failed to fetch family groups:', groupsError);
      } else {
        // Extract children from family groups
        const childrenMap = new Map();

        userGroups?.forEach((userGroup) => {
          // Only process family groups
          if (userGroup.groups.group_type !== 'family') return;

          userGroup.groups.members.forEach((member) => {
            // Skip self
            if (member.user_info_id === userInfo.id) return;

            // Skip if already added (user might be in multiple groups)
            if (childrenMap.has(member.user_info_id)) return;

            // Only include active members who are students
            if (member.status !== 'active') return;

            const memberUserInfo = member.user_infos;
            const isChild = memberUserInfo.user_roles?.some((userRole) =>
              userRole.roles.role_name === 'STUDENT'
            );

            if (isChild) {
              childrenMap.set(member.user_info_id, {
                userInfoId: member.user_info_id,
                email: memberUserInfo.email,
                firstName: memberUserInfo.first_name,
                lastName: memberUserInfo.last_name,
                balance: memberUserInfo.user_credits?.[0]?.credit || 0,
                currency: 'SGD',
                updatedAt: memberUserInfo.user_credits?.[0]?.updated_at
              });
            }
          });
        });

        childrenData = Array.from(childrenMap.values());
        hasChildren = childrenData.length > 0;
      }
    }

    if (hasChildren) {
      // Ensure all children have credit records, create if missing
      const updatedChildrenData = await Promise.all(childrenData.map(async (child) => {
        // If child doesn't have credit record, create one
        if (child.balance === undefined || child.balance === null) {
          const { data: newChildCredit } = await supabase
            .from('user_credits')
            .insert({
              user_info_id: child.userInfoId,
              credit: 0
            })
            .select('credit, updated_at')
            .single();

          return {
            ...child,
            balance: newChildCredit?.credit || 0,
            updatedAt: newChildCredit?.updated_at
          };
        }

        return child;
      }));

      return {
        user: {
          email: user.email,
          balance: userCredits.credit,
          currency: 'SGD',
          updatedAt: userCredits.updated_at
        },
        children: updatedChildrenData,
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
