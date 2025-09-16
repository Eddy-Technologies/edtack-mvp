#!/usr/bin/env node
/* eslint-disable no-case-declarations */

/**
 * Bare Bones Database Management Script
 *
 * Usage:
 *   node database/scripts/db.js <command>
 *
 * Commands:
 *   reset     - Generate migrations and run supabase db reset
 *   seed      - Generate seed.sql and run supabase db seed
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { orderedTableFiles, seedFiles } from './table-config.js';

// Load environment variables
try {
  const { config } = await import('dotenv');
  config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });
} catch {
  // Fallback if dotenv is not available
  console.log('dotenv not available, using manual env loading');
}

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

function getSupabaseWorkDir() {
  const workDir = process.env.SUPABASE_WORK_DIR || path.resolve(__dirname, '../..');
  console.log(`SUPABASE_WORK_DIR: ${process.env.SUPABASE_WORK_DIR}`);
  console.log(`Using work dir: ${workDir}`);
  return workDir;
}

function generateMigrations() {
  try {
    log('\n🔧 Generating migrations...', 'magenta');

    const projectRoot = path.resolve(__dirname, '../..');
    const supabaseWorkDir = getSupabaseWorkDir();
    const tablesDir = path.join(projectRoot, 'database/tables');
    const migrationsDir = path.join(supabaseWorkDir, 'supabase/migrations');

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Clear existing migrations
    const existingMigrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
    existingMigrations.forEach((file) => {
      fs.unlinkSync(path.join(migrationsDir, file));
    });

    // Generate timestamped migration files
    const baseTimestamp = Date.now();

    orderedTableFiles.forEach((file, index) => {
      const sourceFile = path.join(tablesDir, file);
      if (fs.existsSync(sourceFile)) {
        const timestamp = baseTimestamp + (index * 1000); // 1 second apart
        const migrationFile = path.join(migrationsDir, `${timestamp}_${file.replace('.sql', '')}.sql`);

        const content = fs.readFileSync(sourceFile, 'utf8');
        fs.writeFileSync(migrationFile, content);

        log(`   ✅ Generated ${path.basename(migrationFile)}`, 'green');
      } else {
        log(`   ⚠️  Skipping ${file} - not found`, 'yellow');
      }
    });

    log(`🎉 Generated ${orderedTableFiles.length} migration files`, 'green');
  } catch (error) {
    log(`❌ Failed to generate migrations: ${error.message}`, 'red');
    throw error;
  }
}

function checkForExistingData() {
  try {
    log('\n🔍 Checking for existing seed data...', 'magenta');

    // Check if core tables have data
    const checkQueries = [
      'SELECT COUNT(*) FROM roles;',
      'SELECT COUNT(*) FROM level_types;',
      'SELECT COUNT(*) FROM codes;'
    ];

    for (const query of checkQueries) {
      const result = execSync(`psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -t -c "${query}"`, {
        encoding: 'utf8'
      });

      const count = parseInt(result.trim());
      if (count > 0) {
        throw new Error('Database already contains seed data. Use pnpm db:reset first to clear existing data before seeding.');
      }
    }

    log('✅ Database is empty, ready for seeding', 'green');
  } catch (error) {
    if (error.message.includes('already contains seed data')) {
      throw error;
    }
    log(`❌ Failed to check existing data: ${error.message}`, 'red');
    throw new Error('Could not verify database state before seeding');
  }
}

function substituteEnvironmentVariables(content) {
  // Load environment variables
  const envPath = path.resolve(__dirname, '../../.env');
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
      processedContent = processedContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), envVars[key]);
    });

    return processedContent;
  }

  return content;
}

function generateSeedFile() {
  try {
    log('\n🌱 Generating seed.sql...', 'magenta');

    const projectRoot = path.resolve(__dirname, '../..');
    const supabaseWorkDir = getSupabaseWorkDir();
    const seedsDir = path.join(projectRoot, 'database/seeds');
    const supabaseSeedFile = path.join(supabaseWorkDir, 'supabase/seed.sql');

    let combinedSeed = '';
    combinedSeed += '-- Combined Seed File for Supabase\n';
    combinedSeed += '-- Generated automatically - do not edit manually\n\n';

    seedFiles.forEach((file) => {
      const seedFile = path.join(seedsDir, file);
      if (fs.existsSync(seedFile)) {
        let content = fs.readFileSync(seedFile, 'utf8');

        // Substitute environment variables in the content
        content = substituteEnvironmentVariables(content);

        combinedSeed += `-- From: ${file}\n`;
        combinedSeed += content + '\n\n';
        log(`   ✅ Added ${file} (with environment variable substitution)`, 'green');
      } else {
        log(`   ⚠️  Skipping ${file} - not found`, 'yellow');
      }
    });

    // Write combined seed file
    fs.writeFileSync(supabaseSeedFile, combinedSeed);
    log(`🎉 Generated supabase/seed.sql`, 'green');
  } catch (error) {
    log(`❌ Failed to generate seed.sql: ${error.message}`, 'red');
    throw error;
  }
}

function executeCommand(command, description) {
  try {
    log(`\n🔧 ${description}...`, 'magenta');

    // Use the Supabase directory where your instance is running
    const supabaseWorkDir = getSupabaseWorkDir();
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: supabaseWorkDir
    });

    log(`✅ ${description} completed`, 'green');
    return output;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

function showHelp() {
  log('\n📋 EdTack Database Management', 'bold');
  log('===============================\n', 'cyan');

  log('Usage:', 'yellow');
  log('  node database/scripts/db.js <command>\n');

  log('Commands:', 'yellow');
  log('  reset       Generate migrations and run supabase db reset', 'white');
  log('  seed        Generate seed.sql and run via psql', 'white');
  log('  init-admin  Initialize admin user via Supabase Auth Admin API', 'white');
  log('  types       Generate TypeScript types from database schema', 'white');

  log('\nExamples:', 'yellow');
  log('  node database/scripts/db.js reset       # Reset database');
  log('  node database/scripts/db.js seed        # Seed database');
  log('  node database/scripts/db.js init-admin  # Initialize admin user');
  log('  node database/scripts/db.js types       # Generate TypeScript types');
}

async function runCommand(command) {
  try {
    switch (command) {
      case 'reset':
        log('🔄 Starting database reset...', 'bold');
        generateMigrations();
        // Remove seed.sql temporarily to prevent auto-seeding during reset
        const supabaseWorkDir = getSupabaseWorkDir();
        const seedPath = path.join(supabaseWorkDir, 'supabase/seed.sql');
        let hadSeedFile = false;
        let seedContent = '';
        if (fs.existsSync(seedPath)) {
          seedContent = fs.readFileSync(seedPath, 'utf8');
          fs.unlinkSync(seedPath);
          hadSeedFile = true;
          log('📁 Temporarily removed seed.sql to prevent auto-seeding', 'yellow');
        }

        // Run supabase db reset from project root
        try {
          log('\n🔧 Running supabase db reset...', 'magenta');
          execSync('supabase db reset', {
            encoding: 'utf8',
            stdio: 'inherit',
            cwd: supabaseWorkDir
          });
          log('✅ Running supabase db reset completed', 'green');
        } catch (error) {
          log(`❌ Running supabase db reset failed: ${error.message}`, 'red');
          throw error;
        }

        // Restore seed.sql if it existed
        if (hadSeedFile) {
          fs.writeFileSync(seedPath, seedContent);
          log('📁 Restored seed.sql', 'yellow');
        }

        log('\n🎉 Database reset completed!', 'green');
        log('💡 Run `pnpm db:seed` to add seed data', 'yellow');
        break;

      case 'seed':
        log('🌱 Starting database seeding...', 'bold');
        checkForExistingData();
        generateSeedFile();
        executeCommand(`psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f "${path.join(getSupabaseWorkDir(), 'supabase/seed.sql')}"`, 'Running seed file via psql');
        log('\n🎉 Database seeding completed!', 'green');
        log('💡 Run `pnpm upload:characters` to upload character assets', 'yellow');
        break;

      case 'init-admin':
        log('👤 Initializing admin user...', 'bold');
        executeCommand('node database/scripts/init-admin.js', 'Running admin user initialization script');
        log('\n🎉 Admin user initialization completed!', 'green');
        log('💡 Check the output above for login credentials', 'cyan');
        break;

      case 'types':
        log('🔤 Generating TypeScript types...', 'bold');
        executeCommand('supabase gen types typescript --local > types/supabase.ts', 'Generating TypeScript types from database schema');
        log('\n🎉 TypeScript types generated!', 'green');
        log('💡 Types file updated at: types/supabase.ts', 'cyan');
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        log(`❌ Unknown command: ${command}`, 'red');
        log('Run `node database/scripts/db.js help` for available commands', 'yellow');
        process.exit(1);
    }
  } catch (error) {
    log(`\n💥 Command '${command}' failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  showHelp();
  process.exit(1);
}

// Run the command
runCommand(command);
