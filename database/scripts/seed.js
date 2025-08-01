#!/usr/bin/env node

/**
 * Database Seed Script
 * Runs the consolidated seed file: database/seeds/all_seeds.sql
 *
 * Usage: node database/scripts/seed.js
 * or: pnpm db:seed
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

    // Use psql directly with local database connection
    const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    const command = `psql "${dbUrl}" -f "${filePath}"`;
    log(`   Running seed data insertion...`, 'cyan');

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

async function runSeeds() {
  try {
    log('🌱 Starting Database Seeding...', 'magenta');

    const projectRoot = process.cwd();
    const seedFile = path.join(projectRoot, 'database/seeds/all_seeds.sql');

    // Execute the seed file
    executeSQL(seedFile, 'Inserting seed data');

    log('\n🎉 Database seeding completed successfully!', 'green');
    log('📊 All reference data, system codes, and sample products inserted', 'cyan');
    log('💡 Tip: Check your database to verify the data was inserted correctly', 'yellow');
  } catch (error) {
    log(`\n💥 Seeding failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the seeding
runSeeds();
