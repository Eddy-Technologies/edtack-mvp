export function useCredits() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Fetch credits for the current user
  async function getCredits() {
    if (!user.value) return null;
    const { data, error } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', user.value.id)
      .single();
    if (error) throw error;
    return data?.amount ?? 0;
  }

  // Update credits for the current user
  async function updateCredits(amount: number) {
    if (!user.value) throw new Error('No user');
    const { error } = await supabase
      .from('credits')
      .update({ amount })
      .eq('user_id', user.value.id);
    if (error) throw error;
    return true;
  }

  // Add credits for the current user
  async function addCredits(delta: number) {
    const current = await getCredits();
    return updateCredits((current ?? 0) + delta);
  }

  return {
    getCredits,
    updateCredits,
    addCredits,
  };
}
