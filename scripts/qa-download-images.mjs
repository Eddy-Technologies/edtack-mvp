#!/usr/bin/env node
/**
 * QA Download Images Script
 *
 * Downloads all question images from local Supabase Storage
 * to data/qa/images/ so they can be committed and shared.
 *
 * Usage:
 *   node scripts/qa-download-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'data', 'qa', 'images');

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

const env = loadEnv();
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL || env.NUXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = 'question-images';
const PREFIX = 'biology_mcq';

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('\nQA Download Images');
console.log('─'.repeat(40));
console.log(`Source: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}/`);
console.log(`Dest:   ${OUT_DIR}`);
console.log('─'.repeat(40));

// List all files
const { data: files, error: listErr } = await supabase.storage
  .from(BUCKET)
  .list(PREFIX, { limit: 2000 });

if (listErr) {
  console.error('Failed to list files:', listErr.message);
  process.exit(1);
}

console.log(`\nFound ${files.length} images\n`);

let success = 0;
let skip = 0;
let errors = 0;

for (const file of files) {
  const dest = path.join(OUT_DIR, file.name);

  // Skip if already downloaded
  if (fs.existsSync(dest)) {
    skip++;
    continue;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(`${PREFIX}/${file.name}`);

  if (error) {
    console.error(`  ERROR ${file.name}: ${error.message}`);
    errors++;
    continue;
  }

  const buf = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(dest, buf);
  success++;

  if ((success + skip) % 50 === 0) {
    process.stdout.write(`  ${success + skip}/${files.length}\r`);
  }
}

console.log('\n' + '─'.repeat(40));
console.log(`Downloaded: ${success}`);
console.log(`Skipped:    ${skip}`);
console.log(`Errors:     ${errors}`);
console.log(`Total:      ${files.length}`);
console.log('─'.repeat(40) + '\n');

process.exit(errors > 0 ? 1 : 0);
