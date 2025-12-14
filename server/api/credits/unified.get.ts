import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAuth } from '~~/server/utils/auth';
import { GROUP_MEMBER_STATUS, GROUP_TYPE, USER_ROLE } from '~~/shared/constants';

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

    // Get user's internal credit balance (including reserved credits)
    let { data: userCredits } = await supabase
      .from('user_credits')
      .select('credit, reserved_credit, updated_at')
      .eq('user_info_id', userInfo.id)
      .single();

    // If no credit record exists, create one
    if (!userCredits) {
      const { data: newCredit, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_info_id: userInfo.id,
          credit: 0,
          reserved_credit: 0
        })
        .select('credit, reserved_credit, updated_at')
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
      userRole.roles.role_name === USER_ROLE.PARENT
    );

    let hasChildren = false;
    let childrenData = [];

    if (isParent) {
      // Get children data from family groups
      const { data: userGroups, error: groupsError } = await supabase
        .from('group_members')
        .select(`*,
          groups(group_type,
          members:group_members!group_id(*,
            user_infos!group_members_user_info_id_fkey(*, user_roles(*, roles(role_name)))))`)
        .eq('user_info_id', userInfo.id)
        .eq('status', GROUP_MEMBER_STATUS.ACTIVE);

      if (groupsError) {
        console.error('Failed to fetch family groups:', groupsError);
      } else {
        // Extract children from family groups
        const childrenMap = new Map();

        userGroups?.forEach((userGroup) => {
          // Only process family groups
          if (userGroup.groups.group_type !== GROUP_TYPE.FAMILY) return;

          userGroup.groups.members.forEach((member) => {
            // Skip self
            if (member.user_info_id === userInfo.id) return;

            // Skip if already added (user might be in multiple groups)
            if (childrenMap.has(member.user_info_id)) return;

            // Only include active members who are students
            if (member.status !== GROUP_MEMBER_STATUS.ACTIVE) return;

            const memberUserInfo = member.user_infos;
            const isChild = memberUserInfo.user_roles?.some((userRole) =>
              userRole.roles.role_name === USER_ROLE.STUDENT
            );

            if (isChild) {
              childrenMap.set(member.user_info_id, {
                userInfoId: member.user_info_id,
                email: memberUserInfo.email,
                firstName: memberUserInfo.first_name,
                lastName: memberUserInfo.last_name,
                currency: 'SGD'
              });
            }
          });
        });

        childrenData = Array.from(childrenMap.values());
        hasChildren = childrenData.length > 0;

        // Fetch credits directly for all children to ensure we get the latest data
        // (the nested join may not return updated credits reliably)
        if (hasChildren) {
          const childUserInfoIds = childrenData.map((c) => c.userInfoId);
          const { data: childCredits } = await supabase
            .from('user_credits')
            .select('user_info_id, credit, reserved_credit, updated_at')
            .in('user_info_id', childUserInfoIds);

          if (childCredits) {
            const creditsMap = new Map(childCredits.map((c) => [c.user_info_id, c]));
            childrenData = childrenData.map((child) => {
              const credits = creditsMap.get(child.userInfoId);
              return {
                ...child,
                balance: (credits?.credit || 0) - (credits?.reserved_credit || 0),
                reservedCredits: credits?.reserved_credit || 0,
                totalCredits: credits?.credit || 0,
                updatedAt: credits?.updated_at
              };
            });
          }
        }
      }
    }

    // Build response
    const userReserved = userCredits.reserved_credit || 0;
    const response = {
      user: {
        email: user.email,
        balance: userCredits.credit - userReserved,
        reservedCredits: userReserved,
        totalCredits: userCredits.credit,
        currency: 'SGD',
        updatedAt: userCredits.updated_at
      },
      fetchedAt: new Date().toISOString()
    };

    if (hasChildren) {
      return { ...response, children: childrenData };
    }

    return response;
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
