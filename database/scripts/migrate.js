#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs all table files in numerical order from database/tables/
 * 
 * Usage: node database/scripts/migrate.js
 * or: pnpm db:migrate
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Write to temp file and execute via Supabase CLI
    const tempFile = path.join(process.cwd(), '.temp_migration.sql');
    fs.writeFileSync(tempFile, sqlContent);
    
    const command = `pnpm supabase db push --file ${tempFile}`;
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
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

    // Get all SQL files and sort them numerically
    const files = fs.readdirSync(tablesDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        // Extract number from filename (e.g., "001_" -> 1)
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });

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