import { useSupabaseClient, useSupabaseUser } from '#imports';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) throw error;

    // Create user profile in user_infos table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_infos')
        .insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          onboarding_completed: false,
          is_active: true,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getUserProfile = async () => {
    if (!user.value) return null;

    const { data, error } = await supabase
      .from('user_infos')
      .select('*')
      .eq('user_id', user.value.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  };

  const updateUserProfile = async (updates: Record<string, any>) => {
    if (!user.value) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('user_infos')
      .update(updates)
      .eq('user_id', user.value.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Computed properties for easier access
  const isLoggedIn = computed(() => !!user.value);

  const userDisplayName = computed(() => {
    if (!user.value) return 'User';
    return user.value.user_metadata?.first_name ||
      user.value.email?.split('@')[0] ||
      'User';
  });

  return {
    user: readonly(user),
    isLoggedIn,
    userDisplayName,
    signUp,
    signIn,
    signOut,
    getUserProfile,
    updateUserProfile,
  };
};
