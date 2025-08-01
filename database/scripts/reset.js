#!/usr/bin/env node

/**
 * Database Reset Script
 * Runs: drop_all.sql → migrate.js → seed.js
 *
 * Usage: node database/scripts/reset.js
 * or: pnpm db:reset
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

function executeSQL(filePath, description) {
  try {
    log(`\n📁 ${description}...`, 'blue');

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Using Supabase CLI to execute SQL
    const command = `pnpm supabase db reset`;
    log(`   Running: ${command}`, 'cyan');

    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    log(`   ✅ ${description} completed`, 'green');
    return output;
  } catch (error) {
    log(`   ❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

async function resetDatabase() {
  try {
    log('🔄 Starting Database Reset...', 'magenta');
    log('⚠️  This will destroy all data in the database!', 'yellow');

    const projectRoot = process.cwd();
    const dropFile = path.join(projectRoot, 'database/drop/drop_all.sql');

    // Step 1: Drop all tables (using Supabase reset instead of manual drop)
    log('\n🗑️  Step 1: Resetting database...', 'yellow');
    executeSQL(dropFile, 'Database reset');

    // Note: Supabase db reset automatically runs migrations and seeds
    // so we don't need to run migrate.js and seed.js separately

    log('\n🎉 Database reset completed successfully!', 'green');
    log('📊 Database is now ready with all tables and seed data', 'cyan');
  } catch (error) {
    log(`\n💥 Database reset failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
