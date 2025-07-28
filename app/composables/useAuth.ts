import { useMeStore } from '../stores/me';
import { useSupabaseClient } from '#imports';

export interface SignUpReq {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userRole: string;
  studentLevel?: string;
  acceptTerms: boolean; // Optional, can be used for terms acceptance
}

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const { fetchAndSetMe, resetMe } = useMeStore();
  const baseUrl = useRuntimeConfig().public.baseUrl;

  const signUp = async (input: SignUpReq) => {
    const data = await $fetch('/api/auth/register', {
      method: 'POST',
      body: input
    });
    console.log('Sign up response:', data);
    return data;
  };

  const signIn = async (email_val: string, password_val: string) => {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email_val, password: password_val }
    });
    console.log('Sign in response:', data);
    fetchAndSetMe();
    return data;
  };

  const signOut = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST',
    });
    // Sign out from Supabase client side
    await supabase.auth.signOut();
    resetMe();
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
