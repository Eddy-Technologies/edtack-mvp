#!/usr/bin/env node

/**
 * Seed Users Initialization Script
 *
 * This script creates seed users using Supabase Auth Admin API
 * and sets up the corresponding records in user_infos, user_roles, user_credits, etc.
 *
 * Users created:
 *   - Admin (admin@edtack.com / admin123) - ADMIN role
 *   - Parent (parent@test.com / Test123!) - PARENT role, EDDY_PRO_MONTHLY subscription
 *   - Student (student@test.com / Test123!) - STUDENT role, linked to parent via family group
 *
 * Usage:
 *   node database/scripts/init-admin.js
 *
 * Environment Variables:
 *   ADMIN_EMAIL - Admin user email (default: admin@edtack.com)
 *   ADMIN_PASSWORD - Admin user password (default: admin123)
 *   NUXT_PRIVATE_SUPABASE_URL - Supabase project URL
 *   NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load environment variables from .env file if it exists
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Only set if not already set in process.env
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    }
  }
}

// Configuration
function getConfig() {
  loadEnvFile();

  const config = {
    adminEmail: process.env.ADMIN_EMAIL || 'admin@edtack.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    parentEmail: 'parent@test.com',
    parentPassword: 'Test123!',
    studentEmail: 'student@test.com',
    studentPassword: 'Test123!',
    supabaseUrl: process.env.NUXT_PRIVATE_SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_PRIVATE_SUPABASE_KEY
  };

  // Validate required config
  if (!config.supabaseUrl) {
    throw new Error('NUXT_PRIVATE_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_URL environment variable is required');
  }

  if (!config.supabaseServiceKey) {
    throw new Error('NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  return config;
}

// Create Supabase client with service role key
function createSupabaseClient(config) {
  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Generic function to create auth user
async function createAuthUser(supabase, email, password, firstName, lastName, label) {
  log(`\n👤 Creating ${label} user in auth.users...`, 'magenta');

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName
    }
  });

  if (authError) {
    if (authError.message.includes('User already registered') || authError.message.includes('already been registered')) {
      log(`   ⚠️  ${label} user already exists in auth.users`, 'yellow');

      // Try to get existing user
      const { data: existingUser, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw new Error(`Failed to list existing users: ${listError.message}`);
      }

      const foundUser = existingUser.users.find((user) => user.email === email);
      if (!foundUser) {
        throw new Error(`${label} user with email ${email} not found`);
      }

      log(`   ✅ Found existing auth user with ID: ${foundUser.id}`, 'green');
      return foundUser;
    } else {
      throw new Error(`Failed to create ${label} auth user: ${authError.message}`);
    }
  }

  log(`   ✅ Created auth user with ID: ${authUser.user.id}`, 'green');
  return authUser.user;
}

// Generic function to create user_infos record
async function createUserInfo(supabase, authUser, firstName, lastName, label, options = {}) {
  log(`\n📋 Creating ${label} user_infos record...`, 'magenta');

  const userInfoData = {
    id: crypto.randomUUID(),
    user_id: authUser.id,
    email: authUser.email,
    first_name: firstName,
    last_name: lastName,
    is_active: true,
    onboarding_completed: true,
    ...options
  };

  const { data: userInfo, error: userInfoError } = await supabase
    .from('user_infos')
    .insert(userInfoData)
    .select()
    .single();

  if (userInfoError) {
    if (userInfoError.code === '23505') { // Unique constraint violation
      log(`   ⚠️  ${label} user info already exists, fetching existing record...`, 'yellow');

      const { data: existingUserInfo, error: fetchError } = await supabase
        .from('user_infos')
        .select()
        .eq('user_id', authUser.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch existing user_infos: ${fetchError.message}`);
      }

      return existingUserInfo;
    } else {
      throw new Error(`Failed to create ${label} user_infos: ${userInfoError.message}`);
    }
  }

  log(`   ✅ Created user_infos with ID: ${userInfo.id}`, 'green');
  return userInfo;
}

// Role IDs mapping
const ROLE_IDS = {
  ADMIN: 1,
  PARENT: 2,
  STUDENT: 3
};

// Generic function to create user_roles record
async function createUserRole(supabase, userInfo, roleName, label) {
  log(`\n👑 Creating ${label} role assignment...`, 'magenta');

  const roleId = ROLE_IDS[roleName];
  const userRoleData = {
    user_info_id: userInfo.id,
    role_id: roleId,
    role_name: roleName
  };

  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .insert(userRoleData)
    .select()
    .single();

  if (roleError) {
    if (roleError.code === '23505') { // Unique constraint violation
      log(`   ⚠️  ${roleName} role already assigned`, 'yellow');

      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select()
        .eq('user_info_id', userInfo.id)
        .eq('role_id', roleId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch existing user role: ${fetchError.message}`);
      }

      return existingRole;
    } else {
      throw new Error(`Failed to create ${label} user role: ${roleError.message}`);
    }
  }

  log(`   ✅ Assigned ${roleName} role`, 'green');
  return userRole;
}

// Generic function to create user_credits record
async function createUserCredits(supabase, userInfo, creditAmount, label) {
  log(`\n💰 Initializing ${label} user credits...`, 'magenta');

  const creditsData = {
    user_info_id: userInfo.id,
    credit: creditAmount,
    reserved_credit: 0
  };

  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .insert(creditsData)
    .select()
    .single();

  if (creditsError) {
    if (creditsError.code === '23505') { // Unique constraint violation
      log(`   ⚠️  ${label} user credits already initialized`, 'yellow');

      const { data: existingCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select()
        .eq('user_info_id', userInfo.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch existing user credits: ${fetchError.message}`);
      }

      return existingCredits;
    } else {
      throw new Error(`Failed to create ${label} user credits: ${creditsError.message}`);
    }
  }

  log(`   ✅ Initialized with ${credits.credit / 100} SGD credits`, 'green');
  return credits;
}

// Create family group linking parent and student
async function createFamilyGroup(supabase, parentUserInfo, studentUserInfo) {
  log('\n👨‍👩‍👧 Creating family group...', 'magenta');

  // Create group
  const groupData = {
    id: crypto.randomUUID(),
    name: 'Test Family',
    group_type: 'family',
    created_by: parentUserInfo.id
  };

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert(groupData)
    .select()
    .single();

  let familyGroup = group;

  if (groupError) {
    if (groupError.code === '23505') {
      log('   ⚠️  Family group already exists, fetching...', 'yellow');
      const { data: existingGroup } = await supabase
        .from('groups')
        .select()
        .eq('created_by', parentUserInfo.id)
        .eq('group_type', 'family')
        .single();
      familyGroup = existingGroup;
    } else {
      throw new Error(`Failed to create family group: ${groupError.message}`);
    }
  } else {
    log(`   ✅ Created family group with ID: ${group.id}`, 'green');
  }

  // Add parent to group
  const { error: parentMemberError } = await supabase
    .from('group_members')
    .insert({
      group_id: familyGroup.id,
      user_info_id: parentUserInfo.id,
      status: 'active',
      joined_at: new Date().toISOString()
    });

  if (parentMemberError && parentMemberError.code !== '23505') {
    throw new Error(`Failed to add parent to family group: ${parentMemberError.message}`);
  }
  log('   ✅ Added parent to family group', 'green');

  // Add student to group
  const { error: studentMemberError } = await supabase
    .from('group_members')
    .insert({
      group_id: familyGroup.id,
      user_info_id: studentUserInfo.id,
      status: 'active',
      joined_at: new Date().toISOString()
    });

  if (studentMemberError && studentMemberError.code !== '23505') {
    throw new Error(`Failed to add student to family group: ${studentMemberError.message}`);
  }
  log('   ✅ Added student to family group', 'green');

  return familyGroup;
}

// Create subscription for parent
async function createParentSubscription(supabase, parentUserInfo) {
  log('\n💳 Creating parent subscription...', 'magenta');

  const now = new Date();
  const periodStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
  const periodEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from now

  const subscriptionData = {
    id: crypto.randomUUID(),
    user_info_id: parentUserInfo.id,
    stripe_subscription_id: `sub_test_parent_${Date.now()}`,
    stripe_customer_id: `cus_test_parent_${Date.now()}`,
    tier_lookup_key: 'EDDY_PRO_MONTHLY',
    status: 'active',
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd.toISOString(),
    billing_interval: 'month'
  };

  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (subError) {
    if (subError.code === '23505') {
      log('   ⚠️  Parent subscription already exists', 'yellow');
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select()
        .eq('user_info_id', parentUserInfo.id)
        .single();
      return existingSub;
    } else {
      throw new Error(`Failed to create parent subscription: ${subError.message}`);
    }
  }

  log(`   ✅ Created EDDY_PRO_MONTHLY subscription`, 'green');
  return subscription;
}

// Main function
async function initializeSeedUsers() {
  try {
    log('\n🚀 Initializing Seed Users...', 'bold');
    log('================================', 'cyan');

    // Get configuration
    const config = getConfig();

    // Create Supabase client
    const supabase = createSupabaseClient(config);

    // =====================
    // 1. Create Admin User
    // =====================
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('Creating ADMIN user...', 'bold');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const adminAuthUser = await createAuthUser(
      supabase,
      config.adminEmail,
      config.adminPassword,
      'Admin',
      'User',
      'Admin'
    );
    const adminUserInfo = await createUserInfo(
      supabase,
      adminAuthUser,
      'Admin',
      'User',
      'Admin',
      { level_type: 'PRIMARY_6' }
    );
    await createUserRole(supabase, adminUserInfo, 'ADMIN', 'Admin');
    await createUserCredits(supabase, adminUserInfo, 10000, 'Admin');

    // =====================
    // 2. Create Parent User
    // =====================
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('Creating PARENT user...', 'bold');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const parentAuthUser = await createAuthUser(
      supabase,
      config.parentEmail,
      config.parentPassword,
      'Test',
      'Parent',
      'Parent'
    );
    const parentUserInfo = await createUserInfo(
      supabase,
      parentAuthUser,
      'Test',
      'Parent',
      'Parent',
      {}
    );
    await createUserRole(supabase, parentUserInfo, 'PARENT', 'Parent');
    await createUserCredits(supabase, parentUserInfo, 10000, 'Parent');

    // =====================
    // 3. Create Student User
    // =====================
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('Creating STUDENT user...', 'bold');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const studentAuthUser = await createAuthUser(
      supabase,
      config.studentEmail,
      config.studentPassword,
      'Test',
      'Student',
      'Student'
    );
    const studentUserInfo = await createUserInfo(
      supabase,
      studentAuthUser,
      'Test',
      'Student',
      'Student',
      { level_type: 'SECONDARY_3', syllabus_type: 'SG_O_LEVEL' }
    );
    await createUserRole(supabase, studentUserInfo, 'STUDENT', 'Student');
    await createUserCredits(supabase, studentUserInfo, 0, 'Student');

    // =====================
    // 4. Create Family Group
    // =====================
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('Linking Parent and Student...', 'bold');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    await createFamilyGroup(supabase, parentUserInfo, studentUserInfo);

    // =====================
    // 5. Create Parent Subscription
    // =====================
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('Setting up Parent Subscription...', 'bold');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    await createParentSubscription(supabase, parentUserInfo);

    // =====================
    // Summary
    // =====================
    log('\n🎉 Seed users initialization completed successfully!', 'green');
    log('\n📝 Login Credentials:', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log(`   Admin:   ${config.adminEmail} / ${config.adminPassword}`, 'white');
    log(`   Parent:  ${config.parentEmail} / ${config.parentPassword}`, 'white');
    log(`   Student: ${config.studentEmail} / ${config.studentPassword}`, 'white');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('\n💡 Parent has EDDY_PRO_MONTHLY subscription', 'cyan');
    log('💡 Parent and Student are linked via family group', 'cyan');
  } catch (error) {
    log(`\n💥 Seed users initialization failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
initializeSeedUsers();
