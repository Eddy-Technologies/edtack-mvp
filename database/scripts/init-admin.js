#!/usr/bin/env node

/**
 * Creates seed users via Supabase Auth Admin API:
 *   - Admin (admin@edtack.com / admin123)
 *   - Parent (parent@test.com / Test123!) with EDDY_PRO_MONTHLY subscription
 *   - Student (student@test.com / Test123!) linked to parent
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROLE_IDS = { ADMIN: 1, PARENT: 2, STUDENT: 3 };

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) vars[match[1].trim()] = match[2].trim();
  });
  return vars;
}

function getConfig() {
  const env = loadEnv();
  const config = {
    adminEmail: env.ADMIN_EMAIL || 'admin@edtack.com',
    adminPassword: env.ADMIN_PASSWORD || 'admin123',
    parentEmail: 'parent@test.com',
    parentPassword: 'Test123!',
    studentEmail: 'student@test.com',
    studentPassword: 'Test123!',
    supabaseUrl: env.NUXT_PRIVATE_SUPABASE_URL || env.NUXT_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY
  };

  if (!config.supabaseUrl) throw new Error('SUPABASE_URL required');
  if (!config.supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY required');
  return config;
}

async function getOrCreateAuthUser(supabase, email, password, firstName, lastName) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName }
  });

  if (error?.message?.includes('already')) {
    const { data: users } = await supabase.auth.admin.listUsers();
    return users.users.find((u) => u.email === email);
  }
  if (error) throw error;
  return data.user;
}

async function getOrCreateUserInfo(supabase, authUser, firstName, lastName, options = {}) {
  const { data, error } = await supabase
    .from('user_infos')
    .insert({
      id: crypto.randomUUID(),
      user_id: authUser.id,
      email: authUser.email,
      first_name: firstName,
      last_name: lastName,
      is_active: true,
      onboarding_completed: true,
      ...options
    })
    .select()
    .single();

  if (error?.code === '23505') {
    const { data: existing } = await supabase.from('user_infos').select().eq('user_id', authUser.id).single();
    return existing;
  }
  if (error) throw error;
  return data;
}

async function getOrCreateUserRole(supabase, userInfo, roleName) {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_info_id: userInfo.id, role_id: ROLE_IDS[roleName], role_name: roleName });
  if (error && error.code !== '23505') throw error;
}

async function getOrCreateUserCredits(supabase, userInfo, credit) {
  const { error } = await supabase
    .from('user_credits')
    .insert({ user_info_id: userInfo.id, credit, reserved_credit: 0 });
  if (error && error.code !== '23505') throw error;
}

async function getOrCreateFamilyGroup(supabase, parentInfo, studentInfo) {
  let group;
  const { data, error } = await supabase
    .from('groups')
    .insert({ id: crypto.randomUUID(), name: 'Test Family', group_type: 'family', created_by: parentInfo.id })
    .select()
    .single();

  if (error?.code === '23505') {
    const { data: existing } = await supabase
      .from('groups')
      .select()
      .eq('created_by', parentInfo.id)
      .eq('group_type', 'family')
      .single();
    group = existing;
  } else if (error) {
    throw error;
  } else {
    group = data;
  }

  for (const userInfo of [parentInfo, studentInfo]) {
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_info_id: userInfo.id, status: 'active', joined_at: new Date().toISOString() });
    if (memberError && memberError.code !== '23505') throw memberError;
  }
}

async function getOrCreateSubscription(supabase, userInfo) {
  const now = Date.now();
  const { error } = await supabase.from('user_subscriptions').insert({
    id: crypto.randomUUID(),
    user_info_id: userInfo.id,
    stripe_subscription_id: `sub_test_${now}`,
    stripe_customer_id: `cus_test_${now}`,
    tier_lookup_key: 'EDDY_PRO_MONTHLY',
    status: 'active',
    current_period_start: new Date(now - 15 * 86400000).toISOString(),
    current_period_end: new Date(now + 15 * 86400000).toISOString(),
    billing_interval: 'month'
  });
  if (error && error.code !== '23505') throw error;
}

async function createUser(supabase, email, password, firstName, lastName, role, credits, options = {}) {
  const authUser = await getOrCreateAuthUser(supabase, email, password, firstName, lastName);
  const userInfo = await getOrCreateUserInfo(supabase, authUser, firstName, lastName, options);
  await getOrCreateUserRole(supabase, userInfo, role);
  await getOrCreateUserCredits(supabase, userInfo, credits);
  return userInfo;
}

async function main() {
  const config = getConfig();
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Creating admin...');
  await createUser(supabase, config.adminEmail, config.adminPassword, 'Admin', 'User', 'ADMIN', 10000, {
    level_type: 'PRIMARY_6'
  });

  console.log('Creating parent...');
  const parentInfo = await createUser(supabase, config.parentEmail, config.parentPassword, 'Test', 'Parent', 'PARENT', 10000);

  console.log('Creating student...');
  const studentInfo = await createUser(supabase, config.studentEmail, config.studentPassword, 'Test', 'Student', 'STUDENT', 0, {
    level_type: 'SECONDARY_3',
    syllabus_type: 'SG_O_LEVEL'
  });

  console.log('Creating family group...');
  await getOrCreateFamilyGroup(supabase, parentInfo, studentInfo);

  console.log('Creating subscription...');
  await getOrCreateSubscription(supabase, parentInfo);

  console.log(`Done

Credentials:
  ${config.adminEmail} / ${config.adminPassword}
  ${config.parentEmail} / ${config.parentPassword}
  ${config.studentEmail} / ${config.studentPassword}`);
}

main().catch((e) => {
  console.error(`Failed: ${e.message}`);
  process.exit(1);
});
