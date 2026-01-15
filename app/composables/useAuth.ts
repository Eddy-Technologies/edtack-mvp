import { useMeStore } from '../stores/me';
import { useSupabaseClient } from '#imports';

export interface SignUpReq {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userRole: string;
  studentLevel?: string;
  syllabusType?: string;
  dateOfBirth?: string;
  school?: string;
  acceptTerms: boolean;
}

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const meStore = useMeStore();
  const baseUrl = useRuntimeConfig().public.baseUrl;
  const { clearCache: clearCreditCache } = useCredit();

  const signUp = async (input: SignUpReq) => {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: input
    });

    // Check if session was created (email verification off)
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Set session on client - triggers onAuthStateChange
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      // Wait for meStore to be populated before returning
      await meStore.refreshMe();
    }

    console.log('Sign up response:', response);
    return { ...response, hasSession: !!session };
  };

  const signIn = async (email_val: string, password_val: string) => {
    const response = await $fetch<{ data: { session: { access_token: string; refresh_token: string } } }>('/api/auth/login', {
      method: 'POST',
      body: { email: email_val, password: password_val }
    });

    // Set session on client - triggers onAuthStateChange
    if (response.data?.session) {
      await supabase.auth.setSession({
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
      });
    }

    // Wait for meStore to be populated before returning
    await meStore.refreshMe();

    console.log('Sign in response:', response);
    return response;
  };

  const signOut = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST',
    });
    // Sign out from Supabase client side
    await supabase.auth.signOut();
    meStore.resetMe();
    // Clear credit cache to prevent showing previous user's credits
    clearCreditCache();

    console.log('User signed out');
    return;
  };

  const signInWithGoogle = async () => {
    console.log('Signing in with Google and callback to:', `${baseUrl}/api/auth/callback`);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback`,
      }
    });

    if (error) {
      throw error;
    }

    return { data, error };
  };

  return {
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };
};
