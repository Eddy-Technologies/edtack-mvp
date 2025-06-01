import { useSupabaseClient, useSupabaseUser } from '#imports';

export function useRewards() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Reward the user if they score above a threshold in a challenge
  async function rewardForChallenge({
    challengeId,
    score,
    threshold = 80,
    rewardAmount = 10,
    rewardType = 'points',
    extraData = {},
  }: {
    challengeId: string | number;
    score: number;
    threshold?: number;
    rewardAmount?: number;
    rewardType?: string;
    extraData?: Record<string, any>;
  }) {
    if (!user.value) throw new Error('No user');
    if (score < threshold) return false;

    // Insert a reward record
    const { error } = await supabase.from('rewards').insert([
      {
        user_id: user.value.id,
        challenge_id: challengeId,
        score,
        reward_type: rewardType,
        amount: rewardAmount,
        ...extraData,
      },
    ]);
    if (error) throw error;
    return true;
  }

  // Get all rewards for the current user
  async function getRewards() {
    if (!user.value) return [];
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  return {
    rewardForChallenge,
    getRewards,
  };
}
