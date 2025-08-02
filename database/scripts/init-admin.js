#!/usr/bin/env node

/**
 * Admin User Initialization Script
 *
 * This script creates an admin user using Supabase Auth Admin API
 * and sets up the corresponding records in user_infos, user_roles, and user_credits
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

// Create admin user in auth.users table
async function createAuthUser(supabase, config) {
  log('\n👤 Creating admin user in auth.users...', 'magenta');

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: config.adminEmail,
    password: config.adminPassword,
    email_confirm: true,
    user_metadata: {
      first_name: 'Admin',
      last_name: 'User'
    }
  });

  if (authError) {
    if (authError.message.includes('User already registered') || authError.message.includes('already been registered')) {
      log('   ⚠️  Admin user already exists in auth.users', 'yellow');

      // Try to get existing user
      const { data: existingUser, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw new Error(`Failed to list existing users: ${listError.message}`);
      }

      const adminUser = existingUser.users.find((user) => user.email === config.adminEmail);
      if (!adminUser) {
        throw new Error(`Admin user with email ${config.adminEmail} not found`);
      }

      log(`   ✅ Found existing auth user with ID: ${adminUser.id}`, 'green');
      return adminUser;
    } else {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }
  }

  log(`   ✅ Created auth user with ID: ${authUser.user.id}`, 'green');
  return authUser.user;
}

// Create user_infos record
async function createUserInfo(supabase, authUser) {
  log('\n📋 Creating user_infos record...', 'magenta');

  const userInfoData = {
    id: crypto.randomUUID(),
    user_id: authUser.id,
    email: authUser.email,
    first_name: 'Admin',
    last_name: 'User',
    is_active: true,
    onboarding_completed: true,
    level_type: 'PRIMARY_6'
  };

  const { data: userInfo, error: userInfoError } = await supabase
    .from('user_infos')
    .insert(userInfoData)
    .select()
    .single();

  if (userInfoError) {
    if (userInfoError.code === '23505') { // Unique constraint violation
      log('   ⚠️  User info already exists, fetching existing record...', 'yellow');

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
      throw new Error(`Failed to create user_infos: ${userInfoError.message}`);
    }
  }

  log(`   ✅ Created user_infos with ID: ${userInfo.id}`, 'green');
  return userInfo;
}

// Create user_roles record
async function createUserRole(supabase, userInfo) {
  log('\n👑 Creating admin role assignment...', 'magenta');

  const userRoleData = {
    user_info_id: userInfo.id,
    role_id: 1, // ADMIN role ID
    role_name: 'ADMIN'
  };

  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .insert(userRoleData)
    .select()
    .single();

  if (roleError) {
    if (roleError.code === '23505') { // Unique constraint violation
      log('   ⚠️  Admin role already assigned', 'yellow');

      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select()
        .eq('user_info_id', userInfo.id)
        .eq('role_id', 1)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch existing user role: ${fetchError.message}`);
      }

      return existingRole;
    } else {
      throw new Error(`Failed to create user role: ${roleError.message}`);
    }
  }

  log('   ✅ Assigned ADMIN role', 'green');
  return userRole;
}

// Create user_credits record
async function createUserCredits(supabase, userInfo) {
  log('\n💰 Initializing admin user credits...', 'magenta');

  const creditsData = {
    user_info_id: userInfo.id,
    credit: 10000, // 100 SGD in cents
    reserved_credit: 0
  };

  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .insert(creditsData)
    .select()
    .single();

  if (creditsError) {
    if (creditsError.code === '23505') { // Unique constraint violation
      log('   ⚠️  User credits already initialized', 'yellow');

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
      throw new Error(`Failed to create user credits: ${creditsError.message}`);
    }
  }

  log(`   ✅ Initialized with ${credits.credit / 100} SGD credits`, 'green');
  return credits;
}

// Main function
async function initializeAdmin() {
  try {
    log('\n🚀 Initializing Admin User...', 'bold');
    log('================================', 'cyan');

    // Get configuration
    const config = getConfig();
    log(`📧 Admin Email: ${config.adminEmail}`, 'cyan');

    // Create Supabase client
    const supabase = createSupabaseClient(config);

    // Create auth user
    const authUser = await createAuthUser(supabase, config);

    // Create user_infos record
    const userInfo = await createUserInfo(supabase, authUser);

    // Create user_roles record
    await createUserRole(supabase, userInfo);

    // Create user_credits record
    await createUserCredits(supabase, userInfo);

    log('\n🎉 Admin user initialization completed successfully!', 'green');
    log('\n📝 Admin Login Credentials:', 'yellow');
    log(`   Email: ${config.adminEmail}`, 'white');
    log(`   Password: ${config.adminPassword}`, 'white');
    log('\n💡 You can now log in to the admin panel with these credentials', 'cyan');
  } catch (error) {
    log(`\n💥 Admin initialization failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
initializeAdmin();
