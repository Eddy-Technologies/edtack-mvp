#!/usr/bin/env node

/**
 * Database Management Script
 *
 * Commands:
 *   generate  - Generate reset.sql
 *   reset     - Run reset.sql + init-admin (local only)
 *   types     - Generate TypeScript types
 *   diff      - Generate incremental migration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { orderedTableFiles, functionFiles, cronFiles, seedFiles } from './table-config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TABLES_DIR = path.join(ROOT, 'database/tables');
const FUNCTIONS_DIR = path.join(ROOT, 'database/functions');
const CRON_DIR = path.join(ROOT, 'database/cron');
const SEEDS_DIR = path.join(ROOT, 'database/seeds');
const RESET_PATH = path.join(ROOT, 'database/reset.sql');

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

function substituteEnvVars(content, vars) {
  let result = content;
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  });
  return result;
}

function extractTableNames() {
  return orderedTableFiles
    .map((file) => {
      const content = fs.readFileSync(path.join(TABLES_DIR, file), 'utf8');
      const match = content.match(/CREATE TABLE\s+(IF NOT EXISTS\s+)?([a-zA-Z_]\w*)/i);
      return match ? match[2] : null;
    })
    .filter(Boolean);
}

function extractFunctions() {
  const functions = [];
  const extract = (content) => {
    const matches = content.match(/CREATE\s+(OR REPLACE\s+)?FUNCTION\s+([a-zA-Z_][\w.]*)\s*\(/gi) || [];
    matches.forEach((m) => {
      const match = m.match(/FUNCTION\s+([a-zA-Z_][\w.]*)/i);
      if (match) {
        const name = match[1].replace(/^public\./, '');
        if (!functions.includes(name)) functions.push(name);
      }
    });
  };

  orderedTableFiles.forEach((f) => extract(fs.readFileSync(path.join(TABLES_DIR, f), 'utf8')));
  if (fs.existsSync(FUNCTIONS_DIR)) {
    functionFiles?.forEach((f) => {
      const p = path.join(FUNCTIONS_DIR, f);
      if (fs.existsSync(p)) extract(fs.readFileSync(p, 'utf8'));
    });
  }
  return functions;
}

function generateResetFile() {
  const envVars = loadEnv();
  const tables = extractTableNames();
  const funcs = extractFunctions();

  let sql = `-- Generated: ${new Date().toISOString()}\nBEGIN;\n\n`;

  funcs.forEach((fn) => (sql += `DROP FUNCTION IF EXISTS ${fn} CASCADE;\n`));
  sql += '\n';

  [...tables].reverse().forEach((t) => (sql += `DROP TABLE IF EXISTS ${t} CASCADE;\n`));
  sql += '\n';

  orderedTableFiles.forEach((f) => {
    const p = path.join(TABLES_DIR, f);
    if (fs.existsSync(p)) sql += fs.readFileSync(p, 'utf8') + '\n\n';
  });

  functionFiles?.forEach((f) => {
    const p = path.join(FUNCTIONS_DIR, f);
    if (fs.existsSync(p)) sql += fs.readFileSync(p, 'utf8') + '\n\n';
  });

  cronFiles?.forEach((f) => {
    const p = path.join(CRON_DIR, f);
    if (fs.existsSync(p)) sql += fs.readFileSync(p, 'utf8') + '\n\n';
  });

  seedFiles.forEach((f) => {
    const p = path.join(SEEDS_DIR, f);
    if (fs.existsSync(p)) sql += substituteEnvVars(fs.readFileSync(p, 'utf8'), envVars) + '\n\n';
  });

  sql += 'COMMIT;\n';
  fs.writeFileSync(RESET_PATH, sql);
}

const commands = {
  generate() {
    generateResetFile();
    console.log('Generated database/reset.sql');
  },

  reset() {
    generateResetFile();
    console.log('Generated reset.sql');

    execSync(`psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -q -f "${RESET_PATH}"`, {
      cwd: ROOT,
      stdio: 'pipe'
    });
    console.log('Tables dropped');
    console.log('Tables created');
    console.log('Functions created');
    console.log('Data seeded');

    execSync('node database/scripts/init-admin.js', { cwd: ROOT, stdio: 'pipe' });
    console.log('Users created');

    execSync('node database/scripts/upload-assets.js', { cwd: ROOT, stdio: 'pipe' });
    console.log('Assets uploaded');

    console.log('Done');
  },

  types() {
    execSync('supabase gen types typescript --local > types/supabase.ts', {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true
    });
    console.log('Generated types/supabase.ts');
  },

  diff() {
    try {
      execSync('supabase db diff --use-migra', { cwd: ROOT, stdio: 'inherit' });
    } catch {
      // diff returns non-zero when there are differences
    }
  },

  help() {
    console.log(`
Commands:
  generate  Generate reset.sql
  reset     Run reset.sql + init-admin (local)
  types     Generate TypeScript types
  diff      Generate incremental migration
`);
  }
};

const cmd = process.argv[2];
if (!cmd || !commands[cmd]) {
  commands.help();
  process.exit(cmd ? 1 : 0);
}

try {
  commands[cmd]();
} catch (e) {
  console.error(`Failed: ${e.message}`);
  process.exit(1);
}
