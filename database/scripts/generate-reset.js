#!/usr/bin/env node

/**
 * Database Reset Script Generator
 *
 * Generates a comprehensive SQL reset script that can be run directly in Supabase
 * to completely reset the database with all tables and seed data.
 *
 * Usage:
 *   node database/scripts/generate-reset.js
 *   pnpm db:generate-reset-script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { orderedTableFiles, seedFiles } from './table-config.js';

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

function substituteEnvironmentVariables(content) {
  // Load environment variables
  const projectRoot = path.resolve(__dirname, '../..');
  const envPath = path.join(projectRoot, '.env');

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    });

    // Replace template variables in content
    let processedContent = content;
    Object.keys(envVars).forEach((key) => {
      const placeholder = `\${${key}}`;
      processedContent = processedContent.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        envVars[key]
      );
    });

    return processedContent;
  }

  return content;
}

function extractTableNames() {
  const projectRoot = path.resolve(__dirname, '../..');
  const tablesDir = path.join(projectRoot, 'database/tables');
  const tableNames = [];

  orderedTableFiles.forEach((file) => {
    const tablePath = path.join(tablesDir, file);
    if (fs.existsSync(tablePath)) {
      const content = fs.readFileSync(tablePath, 'utf8');
      // Extract table name from CREATE TABLE statement
      const matches = content.match(/CREATE TABLE\s+(IF NOT EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/i);
      if (matches) {
        const tableName = matches[2].trim();
        tableNames.push(tableName);
      }
    }
  });

  return tableNames;
}

function extractFunctions() {
  const projectRoot = path.resolve(__dirname, '../..');
  const tablesDir = path.join(projectRoot, 'database/tables');
  const functions = [];

  orderedTableFiles.forEach((file) => {
    const tablePath = path.join(tablesDir, file);
    if (fs.existsSync(tablePath)) {
      const content = fs.readFileSync(tablePath, 'utf8');
      // Extract function names from CREATE OR REPLACE FUNCTION and CREATE FUNCTION
      const functionMatches = content.match(/CREATE\s+(OR REPLACE\s+)?FUNCTION\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(/gi);
      if (functionMatches) {
        functionMatches.forEach((match) => {
          const funcMatch = match.match(/CREATE\s+(OR REPLACE\s+)?FUNCTION\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(/i);
          if (funcMatch) {
            const funcName = funcMatch[2].replace(/^public\./, '').trim();
            if (!functions.includes(funcName)) {
              functions.push(funcName);
            }
          }
        });
      }
    }
  });

  return functions;
}

function extractTriggers() {
  const projectRoot = path.resolve(__dirname, '../..');
  const tablesDir = path.join(projectRoot, 'database/tables');
  const triggers = [];

  orderedTableFiles.forEach((file) => {
    const tablePath = path.join(tablesDir, file);
    if (fs.existsSync(tablePath)) {
      const content = fs.readFileSync(tablePath, 'utf8');
      // Extract trigger names and tables from CREATE TRIGGER
      const triggerMatches = content.match(/CREATE\s+TRIGGER\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+[^;]*?\s+ON\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
      if (triggerMatches) {
        triggerMatches.forEach((match) => {
          const trigMatch = match.match(/CREATE\s+TRIGGER\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+[^;]*?\s+ON\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
          if (trigMatch) {
            const triggerName = trigMatch[1].trim();
            const tableName = trigMatch[2].trim();
            triggers.push({ name: triggerName, table: tableName });
          }
        });
      }
    }
  });

  return triggers;
}

function generateResetScript() {
  try {
    log('\n🔧 Generating database reset script...', 'magenta');

    const projectRoot = path.resolve(__dirname, '../..');
    const tablesDir = path.join(projectRoot, 'database/tables');
    const seedsDir = path.join(projectRoot, 'database/seeds');
    const outputPath = path.join(projectRoot, 'database/reset.sql');

    let resetScript = '';

    // Header
    resetScript += `-- ==========================================\n`;
    resetScript += `-- EdTack Database Complete Reset Script\n`;
    resetScript += `-- Generated: ${new Date().toISOString()}\n`;
    resetScript += `-- ==========================================\n\n`;

    resetScript += `-- This script completely resets the database:\n`;
    resetScript += `-- 1. Drops all tables (CASCADE)\n`;
    resetScript += `-- 2. Creates all tables with proper structure\n`;
    resetScript += `-- 3. Inserts all seed data\n\n`;

    resetScript += `-- Begin transaction\n`;
    resetScript += `BEGIN;\n\n`;

    // Extract all database objects
    const tableNames = extractTableNames();
    const functions = extractFunctions();
    const triggers = extractTriggers();

    // =====================================
    // DROP TRIGGERS SECTION
    // =====================================
    if (triggers.length > 0) {
      resetScript += `-- ==========================================\n`;
      resetScript += `-- DROP ALL TRIGGERS\n`;
      resetScript += `-- ==========================================\n\n`;

      triggers.forEach((trigger) => {
        resetScript += `DROP TRIGGER IF EXISTS ${trigger.name} ON ${trigger.table} CASCADE;\n`;
      });

      resetScript += `\n-- All triggers dropped\n\n`;
      log(`   ✅ Found ${triggers.length} triggers to drop`, 'green');
    }

    // =====================================
    // DROP FUNCTIONS SECTION
    // =====================================
    if (functions.length > 0) {
      resetScript += `-- ==========================================\n`;
      resetScript += `-- DROP ALL FUNCTIONS\n`;
      resetScript += `-- ==========================================\n\n`;

      functions.forEach((funcName) => {
        resetScript += `DROP FUNCTION IF EXISTS ${funcName} CASCADE;\n`;
      });

      resetScript += `\n-- All functions dropped\n\n`;
      log(`   ✅ Found ${functions.length} functions to drop`, 'green');
    }

    // =====================================
    // DROP TABLES SECTION
    // =====================================
    resetScript += `-- ==========================================\n`;
    resetScript += `-- DROP ALL TABLES (CASCADE for dependencies)\n`;
    resetScript += `-- ==========================================\n\n`;

    // Drop in reverse order to handle dependencies
    const reversedTableNames = [...tableNames].reverse();

    reversedTableNames.forEach((tableName) => {
      resetScript += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`;
    });

    resetScript += `\n-- All tables dropped\n\n`;
    log(`   ✅ Found ${tableNames.length} tables to drop`, 'green');

    // =====================================
    // CREATE TABLES SECTION
    // =====================================
    resetScript += `-- ==========================================\n`;
    resetScript += `-- CREATE ALL TABLES\n`;
    resetScript += `-- ==========================================\n\n`;

    let tablesCreated = 0;
    orderedTableFiles.forEach((file) => {
      const tablePath = path.join(tablesDir, file);
      if (fs.existsSync(tablePath)) {
        const content = fs.readFileSync(tablePath, 'utf8');
        resetScript += `-- From: ${file}\n`;
        resetScript += content + '\n\n';
        tablesCreated++;
        log(`   ✅ Added table: ${file}`, 'green');
      } else {
        log(`   ⚠️  Skipping ${file} - not found`, 'yellow');
      }
    });

    // =====================================
    // SEED DATA SECTION
    // =====================================
    resetScript += `-- ==========================================\n`;
    resetScript += `-- SEED DATA\n`;
    resetScript += `-- ==========================================\n\n`;

    let seedsAdded = 0;
    seedFiles.forEach((file) => {
      const seedPath = path.join(seedsDir, file);
      if (fs.existsSync(seedPath)) {
        let content = fs.readFileSync(seedPath, 'utf8');

        // Substitute environment variables
        content = substituteEnvironmentVariables(content);

        resetScript += `-- Seed data from: ${file}\n`;
        resetScript += content + '\n\n';
        seedsAdded++;
        log(`   ✅ Added seed: ${file}`, 'green');
      } else {
        log(`   ⚠️  Skipping seed ${file} - not found`, 'yellow');
      }
    });

    // Footer
    resetScript += `-- Commit transaction\n`;
    resetScript += `COMMIT;\n\n`;

    resetScript += `-- ==========================================\n`;
    resetScript += `-- RESET COMPLETE\n`;
    resetScript += `-- Triggers dropped: ${triggers.length}\n`;
    resetScript += `-- Functions dropped: ${functions.length}\n`;
    resetScript += `-- Tables dropped: ${tableNames.length}\n`;
    resetScript += `-- Tables created: ${tablesCreated}\n`;
    resetScript += `-- Seed files applied: ${seedsAdded}\n`;
    resetScript += `-- Generated: ${new Date().toISOString()}\n`;
    resetScript += `-- ==========================================\n`;

    // Write the script
    fs.writeFileSync(outputPath, resetScript);

    log(`\n🎉 Database reset script generated successfully!`, 'green');
    log(`📁 Output: database/reset.sql`, 'cyan');
    log(`📊 Triggers: ${triggers.length}, Functions: ${functions.length}, Tables: ${tablesCreated}, Seeds: ${seedsAdded}`, 'cyan');
    log(`\n💡 To use this script:`, 'yellow');
    log(`   1. Copy the contents of database/reset.sql`, 'white');
    log(`   2. Paste into Supabase SQL Editor`, 'white');
    log(`   3. Run the script to completely reset your database`, 'white');
  } catch (error) {
    log(`\n❌ Failed to generate reset script: ${error.message}`, 'red');
    throw error;
  }
}

// Run the script
generateResetScript();
