import { getStripe } from '~~/server/utils/stripe';
import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const stripe = getStripe();

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
    const parentCustomer = await stripe.customers.search({
      query: `email:'${user.email}'`,
      limit: 1,
    });

    if (hasChildren) {
      const childrenCustomer = await Promise.all(parentWithChildren.parent_child.map(async (child) => {
        const customer = await stripe.customers.search({
          query: `email:'${child.all_users.email}'`,
          limit: 1,
        });
        return {
          userInfoId: child.child_user_info_id,
          email: child.all_users.email,
          firstName: child.all_users.first_name,
          lastName: child.all_users.last_name,
          customerId: customer?.data[0]?.id || null,
          balance: customer?.data[0]?.balance || 0,
          currency: customer?.data[0]?.currency || 'SGD'
        };
      }));

      return {
        user: {
          email: user.email,
          customerId: parentCustomer?.data[0]?.id,
          balance: parentCustomer?.data[0]?.balance,
          currency: parentCustomer?.data[0]?.currency
        },
        children: childrenCustomer,
        fetchedAt: new Date().toISOString()
      };
    } else {
      return {
        user: {
          email: user.email,
          customerId: parentCustomer?.data[0]?.id,
          balance: parentCustomer?.data[0]?.balance,
          currency: parentCustomer?.data[0]?.currency
        },
        fetchedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Failed to get unified credit data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve credit data'
    });
  }
});
