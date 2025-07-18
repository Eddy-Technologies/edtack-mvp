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
    const { fetchAndSetMe } = useMeStore();
    fetchAndSetMe();
    return data;
  };

  const signOut = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST',
    });
    // Sign out from Supabase client side
    await supabase.auth.signOut();
    const { resetMe } = useMeStore();
    resetMe();
    console.log('User signed out');
    return;
  };

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' && session) {
      console.log('User signed initial sess onAuthStateChange:', session);
      const { fetchAndSetMe } = useMeStore();
      fetchAndSetMe();
    }
    // Currently, we are not handling other events like 'SIGNED_IN', 'SIGNED_OUT', etc. because it does not work.
  });

  return {
    signUp,
    signIn,
    signOut,
  };
};
