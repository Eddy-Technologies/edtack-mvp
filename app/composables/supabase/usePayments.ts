import { useSupabaseClient, useSupabaseUser } from '@supabase/auth-helpers-nuxt';

export function usePayments() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Fetch all payments for the current user
  async function getPayments() {
    if (!user.value) return [];
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  // Add a new payment for the current user
  async function addPayment(paymentData: Record<string, any>) {
    if (!user.value) throw new Error('No user');
    const { error } = await supabase
      .from('payments')
      .insert([{ ...paymentData, user_id: user.value.id }]);
    if (error) throw error;
    return true;
  }

  return {
    getPayments,
    addPayment,
  };
}
