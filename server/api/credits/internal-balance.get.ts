import { getSupabaseClient } from '#imports';
import { getUserInfo } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);

    // Get authenticated user info
    const userInfo = await getUserInfo(event);

    // Get user's internal credit balance
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credit, updated_at')
      .eq('user_info_id', userInfo.id)
      .single();

    if (creditError) {
      // If no record exists, create one with 0 credits
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

      return {
        balance: 0,
        balanceInDollars: 0,
        currency: 'SGD',
        updatedAt: newCredit.updated_at
      };
    }

    return {
      balance: creditData.credit,
      balanceInDollars: (creditData.credit / 100).toFixed(2),
      currency: 'SGD',
      updatedAt: creditData.updated_at
    };
  } catch (error) {
    console.error('Failed to get internal credit balance:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve internal credit balance'
    });
  }
});
