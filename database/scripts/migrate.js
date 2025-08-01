#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs all table files in numerical order from database/tables/
 *
 * Usage: node database/scripts/migrate.js
 * or: pnpm db:migrate
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeSQL(filePath, fileName) {
  try {
    log(`   📝 ${fileName}...`, 'cyan');

    // Use psql directly with local database connection
    const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    const command = `psql "${dbUrl}" -f "${filePath}"`;

    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    log(`   ✅ ${fileName} completed`, 'green');
    return output;
  } catch (error) {
    log(`   ❌ ${fileName} failed: ${error.message}`, 'red');
    throw error;
  }
}

async function runMigrations() {
  try {
    log('🔧 Starting Database Migration...', 'magenta');

    const projectRoot = process.cwd();
    const tablesDir = path.join(projectRoot, 'database/tables');

    if (!fs.existsSync(tablesDir)) {
      throw new Error(`Tables directory not found: ${tablesDir}`);
    }

    // Define the correct dependency order for table creation
    const orderedFiles = [
      // Base tables (no dependencies)
      'roles.sql',
      'level_types.sql',
      'codes.sql',
      'subjects.sql',

      // User-related tables
      'user_infos.sql', // references level_types
      'user_roles.sql', // references user_infos, roles
      'user_credits.sql', // references user_infos
      'groups.sql', // references user_infos
      'group_members.sql', // references groups, user_infos

      // Content tables
      'syllabus.sql', // references subjects
      'questions.sql', // references syllabus
      'question_options.sql', // references questions
      'question_correct_answers.sql', // references questions, question_options

      // User interaction tables
      'user_question_attempts.sql', // references user_infos, questions
      'user_question_answers.sql', // references user_question_attempts, question_options

      // Commerce tables
      'products.sql', // no dependencies
      'orders.sql', // references user_infos
      'order_items.sql', // references orders, products
      'wishlists.sql', // references user_infos, products

      // Task and transaction tables
      'user_tasks.sql', // references user_infos
      'credit_transactions.sql', // references user_infos

      // Event tracking
      'stripe_webhook_events.sql', // no dependencies

      // Views and functions (must be last)
      'functions.sql'
    ];

    // Verify all files exist
    const existingFiles = fs.readdirSync(tablesDir).filter((file) => file.endsWith('.sql'));
    const missingFiles = orderedFiles.filter((file) => !existingFiles.includes(file));
    const extraFiles = existingFiles.filter((file) => !orderedFiles.includes(file));

    if (missingFiles.length > 0) {
      throw new Error(`Missing expected files: ${missingFiles.join(', ')}`);
    }

    if (extraFiles.length > 0) {
      log(`⚠️  Found unexpected files (will be skipped): ${extraFiles.join(', ')}`, 'yellow');
    }

    const files = orderedFiles;

    if (files.length === 0) {
      throw new Error('No SQL files found in tables directory');
    }

    log(`📋 Found ${files.length} migration files`, 'blue');

    // Execute each file in order
    for (const file of files) {
      const filePath = path.join(tablesDir, file);
      executeSQL(filePath, file);
    }

    log('\n🎉 All migrations completed successfully!', 'green');
    log(`📊 ${files.length} tables created/updated`, 'cyan');
  } catch (error) {
    log(`\n💥 Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the migrations
runMigrations();
