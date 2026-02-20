#!/usr/bin/env node
/**
 * Upload QA Question Images Script
 *
 * Uploads question images from data/qa/images/ to Supabase Storage
 * under the question-images/biology_mcq/ path.
 *
 * Run this after cloning to seed images for local dev,
 * or point at dev/prod Supabase to upload there.
 *
 * Usage:
 *   node supabase/scripts/upload-qa-images.js
 *   node supabase/scripts/upload-qa-images.js <supabase-url> <service-role-key>
 *
 * Environment Variables:
 *   NUXT_PUBLIC_SUPABASE_URL
 *   NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IMAGES_DIR = path.join(ROOT, 'data', 'qa', 'images');

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
const SUPABASE_URL = process.argv[2] || process.env.NUXT_PUBLIC_SUPABASE_URL || env.NUXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.argv[3] || process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

if (!fs.existsSync(IMAGES_DIR)) {
  console.error(`Images directory not found: ${IMAGES_DIR}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = 'question-images';
const PREFIX = 'biology_mcq';

const files = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

console.log('\nUpload QA Images');
console.log('─'.repeat(50));
console.log(`Target: ${SUPABASE_URL}`);
console.log(`Images: ${IMAGES_DIR}`);
console.log(`Count:  ${files.length}`);
console.log('─'.repeat(50));

let success = 0;
let errors = 0;

for (const filename of files) {
  const filePath = path.join(IMAGES_DIR, filename);
  const storagePath = `${PREFIX}/${filename}`;
  const contentType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const fileBuffer = fs.readFileSync(filePath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (error) {
    console.error(`  ERROR ${filename}: ${error.message}`);
    errors++;
  } else {
    success++;
  }

  if ((success + errors) % 50 === 0) {
    process.stdout.write(`  ${success + errors}/${files.length}\r`);
  }
}

console.log('\n' + '─'.repeat(50));
console.log(`Uploaded: ${success}`);
console.log(`Errors:   ${errors}`);
console.log(`Total:    ${files.length}`);
console.log('─'.repeat(50));

// Update questions.json URLs to point to the uploaded location
if (errors === 0) {
  const questionsPath = path.join(ROOT, 'data', 'qa', 'questions.json');
  if (fs.existsSync(questionsPath)) {
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}`;
    let updated = 0;

    const result = questions.map((q) => {
      if (!q.question_image_url) return q;
      // Replace any host with the current Supabase URL
      const filename = q.question_image_url.split('/').pop();
      const newUrl = `${baseUrl}/${filename}`;
      if (q.question_image_url !== newUrl) {
        updated++;
        return { ...q, question_image_url: newUrl };
      }
      return q;
    });

    if (updated > 0) {
      fs.writeFileSync(questionsPath, JSON.stringify(result, null, 2));
      console.log(`\nUpdated ${updated} question_image_url(s) to point to ${SUPABASE_URL}`);
    }
  }
}

console.log('');
process.exit(errors > 0 ? 1 : 0);
