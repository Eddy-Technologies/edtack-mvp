#!/usr/bin/env node

/**
 * Import Lessons Script
 *
 * Loads lesson JSON files from supabase/lessons/ into the chapters.lesson column.
 * This is the counterpart to seed-lessons.js which generates the JSON files.
 *
 * Usage:
 *   # Import all lessons from JSON files
 *   node supabase/scripts/import-lessons.js
 *
 *   # Import lessons for a specific subject
 *   node supabase/scripts/import-lessons.js --subject o_level_singapore_biology
 *   node supabase/scripts/import-lessons.js --subject biology
 *
 *   # Import a specific chapter
 *   node supabase/scripts/import-lessons.js --chapter o_level_singapore_biology_chapter_01_cell_structure_and_organization
 *
 *   # Skip chapters that already have lessons in DB
 *   node supabase/scripts/import-lessons.js --skip-existing
 *
 * Environment Variables:
 *   NUXT_PUBLIC_SUPABASE_URL or NUXT_PRIVATE_SUPABASE_URL - Supabase URL
 *   NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY - Service role key
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LESSONS_DIR = path.join(ROOT, 'supabase', 'lessons');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    subject: null,
    chapter: null,
    skipExisting: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--subject' && args[i + 1]) {
      result.subject = args[++i];
    } else if (args[i] === '--chapter' && args[i + 1]) {
      result.chapter = args[++i];
    } else if (args[i] === '--skip-existing') {
      result.skipExisting = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      result.help = true;
    }
  }

  return result;
}

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) vars[match[1].trim()] = match[2].trim();
    });
  return vars;
}

// Get configuration
function getConfig() {
  const env = loadEnv();
  const config = {
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.NUXT_PRIVATE_SUPABASE_URL || env.NUXT_PUBLIC_SUPABASE_URL || env.NUXT_PRIVATE_SUPABASE_URL,
    supabaseServiceKey: process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!config.supabaseUrl) throw new Error('SUPABASE_URL required (NUXT_PUBLIC_SUPABASE_URL or NUXT_PRIVATE_SUPABASE_URL)');
  if (!config.supabaseServiceKey) throw new Error('NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY required');

  return config;
}

// Get all lesson JSON files
function getLessonFiles(subjectFilter, chapterFilter) {
  const files = [];

  if (!fs.existsSync(LESSONS_DIR)) {
    return files;
  }

  const subjectDirs = fs.readdirSync(LESSONS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const subjectId of subjectDirs) {
    // Filter by subject if specified
    if (subjectFilter) {
      if (subjectFilter.includes('_')) {
        if (subjectId !== subjectFilter) continue;
      } else {
        if (!subjectId.toLowerCase().includes(subjectFilter.toLowerCase())) continue;
      }
    }

    const subjectDir = path.join(LESSONS_DIR, subjectId);
    const jsonFiles = fs.readdirSync(subjectDir)
      .filter((file) => file.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
      const chapterName = jsonFile.replace('.json', '');

      // Filter by chapter if specified
      if (chapterFilter && chapterName !== chapterFilter) continue;

      files.push({
        subjectId,
        chapterName,
        filePath: path.join(subjectDir, jsonFile),
      });
    }
  }

  return files;
}

// Update chapter with lesson content
async function updateChapterLesson(supabase, chapterName, lessonContent) {
  const { error } = await supabase
    .from('chapters')
    .update({ lesson: lessonContent })
    .eq('name', chapterName);

  if (error) {
    throw new Error(`Failed to update chapter: ${error.message}`);
  }
}

// Check if chapter already has lesson
async function chapterHasLesson(supabase, chapterName) {
  const { data, error } = await supabase
    .from('chapters')
    .select('lesson')
    .eq('name', chapterName)
    .single();

  if (error) return false;
  return !!data?.lesson;
}

// Main function
async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(`
Import Lessons Script

Loads lesson JSON files from supabase/lessons/ into the database.

Usage:
  node supabase/scripts/import-lessons.js
  node supabase/scripts/import-lessons.js --subject <subject_id>
  node supabase/scripts/import-lessons.js --chapter <chapter_name>

Options:
  --subject <id>     Import lessons for a specific subject
                     Supports partial match: --subject biology
                     Or exact match: --subject o_level_singapore_biology
  --chapter <name>   Import a specific chapter
  --skip-existing    Skip chapters that already have lessons in DB
  --help, -h         Show this help message

Examples:
  node supabase/scripts/import-lessons.js
  node supabase/scripts/import-lessons.js --subject biology
  node supabase/scripts/import-lessons.js --skip-existing
    `);
    process.exit(0);
  }

  const config = getConfig();
  console.log('\n📥 Import Lessons Script');
  console.log('━'.repeat(50));
  console.log(`📡 Supabase URL: ${config.supabaseUrl}`);
  console.log(`📁 Source: ${LESSONS_DIR}`);
  if (args.subject) console.log(`📦 Subject filter: ${args.subject}`);
  if (args.chapter) console.log(`📖 Chapter filter: ${args.chapter}`);
  console.log(`⏭️  Skip existing: ${args.skipExisting}`);
  console.log('━'.repeat(50));

  // Get lesson files
  const files = getLessonFiles(args.subject, args.chapter);

  if (files.length === 0) {
    console.error('\n❌ No lesson JSON files found');
    console.error(`   Check that ${LESSONS_DIR} contains JSON files`);
    process.exit(1);
  }

  console.log(`\n📚 Found ${files.length} lesson file(s) to import\n`);

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const file of files) {
    console.log(`\n📖 Importing: ${file.chapterName}`);

    // Skip if chapter already has lesson and --skip-existing is set
    if (args.skipExisting) {
      const hasLesson = await chapterHasLesson(supabase, file.chapterName);
      if (hasLesson) {
        console.log('   ⏭️  Skipping (already has lesson in DB)');
        skipCount++;
        continue;
      }
    }

    try {
      // Read JSON file
      const content = fs.readFileSync(file.filePath, 'utf8');
      const slides = JSON.parse(content);
      const fileSize = (fs.statSync(file.filePath).size / 1024).toFixed(1);

      console.log(`   📄 Read ${slides.length} slides (${fileSize}KB)`);

      // Update database
      await updateChapterLesson(supabase, file.chapterName, content);
      console.log('   ✅ Imported to database');

      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Summary');
  console.log('━'.repeat(50));
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📚 Total: ${files.length}`);
  console.log('━'.repeat(50) + '\n');

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
