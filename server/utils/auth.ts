import type { H3Event } from 'h3';
import { getSupabaseClient } from './authConfig';
import type { Database } from '~~/types/supabase';

type UserInfo = Database['public']['Tables']['user_infos']['Row'];
type User = {
  id: string;
  email?: string;
  [key: string]: any;
};

export async function requireAuth(event: H3Event): Promise<User> {
  const supabase = await getSupabaseClient(event);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  return user;
}

export async function requireAdmin(event: H3Event): Promise<UserInfo> {
  const user = await requireAuth(event);
  const supabase = await getSupabaseClient(event);

  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('*, user_roles(role_name)')
    .eq('user_id', user.id)
    .single();

  if (error || !userInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User info not found'
    });
  }

  const roleName = userInfo.user_roles?.[0]?.role_name;
  if (!roleName || roleName !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    });
  }

  return userInfo;
}

export async function getUserInfo(event: H3Event): Promise<UserInfo> {
  const supabase = await getSupabaseClient(event);

  const user = await requireAuth(event);

  const { data: userInfo, error } = await supabase
    .from('user_infos')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !userInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User info not found'
    });
  }

  return userInfo;
}
