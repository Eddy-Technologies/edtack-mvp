#!/usr/bin/env node

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

function generateMigrations() {
  try {
    log('\n🔧 Generating migrations...', 'magenta');

    const projectRoot = path.resolve(__dirname, '../..');
    const tablesDir = path.join(projectRoot, 'database/tables');
    const migrationsDir = path.join(projectRoot, 'supabase/migrations');

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Clear existing migrations
    const existingMigrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
    existingMigrations.forEach((file) => {
      fs.unlinkSync(path.join(migrationsDir, file));
    });

    // Define table creation order (dependencies)
    const orderedFiles = [
      'roles.sql',
      'level_types.sql',
      'codes.sql',
      'subjects.sql',
      'user_infos.sql',
      'user_roles.sql',
      'user_credits.sql',
      'groups.sql',
      'group_members.sql',
      'syllabus.sql',
      'questions.sql',
      'question_options.sql',
      'question_correct_answers.sql',
      'user_question_attempts.sql',
      'user_question_answers.sql',
      'products.sql',
      'orders.sql',
      'order_items.sql',
      'wishlists.sql',
      'user_tasks.sql',
      'credit_transactions.sql',
      'characters.sql',
      'notes.sql',
      'stripe_webhook_events.sql',
      'functions.sql'
    ];

    // Generate timestamped migration files
    const baseTimestamp = Date.now();

    orderedFiles.forEach((file, index) => {
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

    log(`🎉 Generated ${orderedFiles.length} migration files`, 'green');
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

function generateSeedFile() {
  try {
    log('\n🌱 Generating seed.sql...', 'magenta');

    const projectRoot = path.resolve(__dirname, '../..');
    const seedsDir = path.join(projectRoot, 'database/seeds');
    const supabaseSeedFile = path.join(projectRoot, 'supabase/seed.sql');

    // Seed files to combine (in order)
    const seedFiles = [
      'all_seeds.sql',
      'characters.sql'
    ];

    let combinedSeed = '';
    combinedSeed += '-- Combined Seed File for Supabase\n';
    combinedSeed += '-- Generated automatically - do not edit manually\n\n';

    seedFiles.forEach((file) => {
      const seedFile = path.join(seedsDir, file);
      if (fs.existsSync(seedFile)) {
        const content = fs.readFileSync(seedFile, 'utf8');
        combinedSeed += `-- From: ${file}\n`;
        combinedSeed += content + '\n\n';
        log(`   ✅ Added ${file}`, 'green');
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

    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../..')
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
  log('  reset     Generate migrations and run supabase db reset', 'white');
  log('  seed      Generate seed.sql and run via psql', 'white');

  log('\nExamples:', 'yellow');
  log('  node database/scripts/db.js reset     # Reset database');
  log('  node database/scripts/db.js seed      # Seed database');
}

async function runCommand(command) {
  try {
    switch (command) {
      case 'reset':
        log('🔄 Starting database reset...', 'bold');
        generateMigrations();
        // Remove seed.sql temporarily to prevent auto-seeding during reset
        const seedPath = path.resolve(__dirname, '../../supabase/seed.sql');
        let hadSeedFile = false;
        let seedContent = '';
        if (fs.existsSync(seedPath)) {
          seedContent = fs.readFileSync(seedPath, 'utf8');
          fs.unlinkSync(seedPath);
          hadSeedFile = true;
          log('📁 Temporarily removed seed.sql to prevent auto-seeding', 'yellow');
        }
        
        executeCommand('supabase db reset', 'Running supabase db reset');
        
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
        executeCommand('psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed.sql', 'Running seed file via psql');
        log('\n🎉 Database seeding completed!', 'green');
        log('💡 Seed data has been inserted into the database', 'cyan');
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
