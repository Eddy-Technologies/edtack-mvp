#!/usr/bin/env node

/**
 * Seed Lessons Script
 *
 * Calls the Python backend to generate lessons for chapters and saves
 * them as JSON files in supabase/lessons/{subject_id}/{chapter_name}.json
 *
 * Usage:
 *   # Generate lessons and save to JSON files (default)
 *   node supabase/scripts/seed-lessons.js --subject o_level_singapore_biology
 *
 *   # Generate for specific chapter
 *   node supabase/scripts/seed-lessons.js --chapter o_level_singapore_biology_chapter_01_cell_structure_and_organization
 *
 *   # Skip chapters that already have JSON files
 *   node supabase/scripts/seed-lessons.js --subject o_level_singapore_biology --skip-existing
 *
 *   # With custom Python API URL
 *   PYTHON_API_URL=http://localhost:8000 node supabase/scripts/seed-lessons.js --subject o_level_singapore_biology
 *
 * Environment Variables:
 *   NUXT_PUBLIC_SUPABASE_URL or NUXT_PRIVATE_SUPABASE_URL - Supabase URL
 *   NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY - Service role key
 *   PYTHON_API_URL - Python backend URL (default: http://localhost:8000)
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
    pythonApiUrl: process.env.PYTHON_API_URL || env.PYTHON_API_URL || 'http://localhost:8000',
  };

  if (!config.supabaseUrl) throw new Error('SUPABASE_URL required (NUXT_PUBLIC_SUPABASE_URL or NUXT_PRIVATE_SUPABASE_URL)');
  if (!config.supabaseServiceKey) throw new Error('NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY required');

  return config;
}

// Extract subject display name from subject_id (e.g., "o_level_singapore_biology" -> "Biology")
function getSubjectDisplayName(subjectId) {
  const parts = subjectId.split('_');
  // Get last part and capitalize
  const name = parts[parts.length - 1];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Generate lesson prompt for a chapter
function generateLessonPrompt(chapterDisplayName, subjectDisplayName) {
  return `I want to learn about ${subjectDisplayName}, specifically the chapter "${chapterDisplayName}".`;
}

// Get the JSON file path for a chapter
function getLessonFilePath(subjectId, chapterName) {
  const subjectDir = path.join(LESSONS_DIR, subjectId);
  return path.join(subjectDir, `${chapterName}.json`);
}

// Check if lesson JSON file exists
function lessonFileExists(subjectId, chapterName) {
  const filePath = getLessonFilePath(subjectId, chapterName);
  return fs.existsSync(filePath);
}

// Save lesson to JSON file
function saveLessonToFile(subjectId, chapterName, slides) {
  const subjectDir = path.join(LESSONS_DIR, subjectId);

  // Create directories if they don't exist
  if (!fs.existsSync(LESSONS_DIR)) {
    fs.mkdirSync(LESSONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(subjectDir)) {
    fs.mkdirSync(subjectDir, { recursive: true });
  }

  const filePath = getLessonFilePath(subjectId, chapterName);
  fs.writeFileSync(filePath, JSON.stringify(slides, null, 2));
  return filePath;
}

// Call Python backend to generate lesson
async function generateLesson(pythonApiUrl, chapterDisplayName, subjectDisplayName) {
  const threadId = crypto.randomUUID();
  const prompt = generateLessonPrompt(chapterDisplayName, subjectDisplayName);

  const requestBody = {
    input: prompt,
    user_info: {
      subject: subjectDisplayName,
      level: 'SECONDARY_3',
      country: 'SINGAPORE',
      personality_prompt: 'no personality needed',
    },
  };

  console.log(`  📤 Calling Python backend with prompt: "${prompt.substring(0, 60)}..."`);

  const response = await fetch(`${pythonApiUrl}/api/v1/task/${threadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Python API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.teaching_mat || !Array.isArray(data.teaching_mat)) {
    throw new Error('Invalid response: teaching_mat array missing');
  }

  return {
    slides: data.teaching_mat,
  };
}

// Main function
async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(`
Seed Lessons Script

Generates lessons from Python backend and saves them as JSON files.

Usage:
  node supabase/scripts/seed-lessons.js --subject <subject_id>
  node supabase/scripts/seed-lessons.js --chapter <chapter_name>

Options:
  --subject <id>     Generate lessons for all chapters of a subject
                     Supports partial match: --subject biology (matches all biology subjects)
                     Or exact match: --subject o_level_singapore_biology
  --chapter <name>   Generate lesson for a specific chapter
  --skip-existing    Skip chapters that already have JSON files
  --help, -h         Show this help message

Output:
  JSON files are saved to supabase/lessons/{subject_id}/{chapter_name}.json

Examples:
  node supabase/scripts/seed-lessons.js --subject biology
  node supabase/scripts/seed-lessons.js --subject o_level_singapore_biology
  node supabase/scripts/seed-lessons.js --chapter o_level_singapore_biology_chapter_01_cell_structure_and_organization --skip-existing
    `);
    process.exit(0);
  }

  if (!args.subject && !args.chapter) {
    console.error('❌ Error: Either --subject or --chapter is required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const config = getConfig();
  console.log('\n🚀 Seed Lessons Script');
  console.log('━'.repeat(50));
  console.log(`📡 Supabase URL: ${config.supabaseUrl}`);
  console.log(`🐍 Python API URL: ${config.pythonApiUrl}`);
  console.log(`📦 Target: ${args.subject ? `Subject: ${args.subject}` : `Chapter: ${args.chapter}`}`);
  console.log(`📁 Output: ${LESSONS_DIR}`);
  console.log(`⏭️  Skip existing: ${args.skipExisting}`);
  console.log('━'.repeat(50));

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  // Query chapters to seed
  let query = supabase.from('chapters').select('name, display_name, subject_id').order('sort_order');

  if (args.subject) {
    // Support both exact match (o_level_singapore_biology) and partial match (biology)
    if (args.subject.includes('_')) {
      // Exact match for full subject_id
      query = query.eq('subject_id', args.subject);
    } else {
      // Partial match - find subjects containing the keyword (case-insensitive)
      query = query.ilike('subject_id', `%${args.subject}%`);
    }
  } else if (args.chapter) {
    query = query.eq('name', args.chapter);
  }

  const { data: chapters, error: chaptersError } = await query;

  if (chaptersError) {
    console.error('❌ Error fetching chapters:', chaptersError.message);
    process.exit(1);
  }

  if (!chapters || chapters.length === 0) {
    console.error('❌ No chapters found matching the criteria');
    process.exit(1);
  }

  console.log(`\n📚 Found ${chapters.length} chapter(s) to process\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const chapter of chapters) {
    console.log(`\n📖 Processing: ${chapter.display_name}`);
    console.log(`   Chapter ID: ${chapter.name}`);

    // Skip if JSON file already exists and --skip-existing is set
    if (args.skipExisting && lessonFileExists(chapter.subject_id, chapter.name)) {
      console.log('   ⏭️  Skipping (JSON file already exists)');
      skipCount++;
      continue;
    }

    try {
      const subjectDisplayName = getSubjectDisplayName(chapter.subject_id);

      // Generate lesson
      const startTime = Date.now();
      const { slides } = await generateLesson(
        config.pythonApiUrl,
        chapter.display_name,
        subjectDisplayName
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`  ✅ Generated ${slides.length} slides in ${duration}s`);

      // Save to JSON file
      const filePath = saveLessonToFile(chapter.subject_id, chapter.name, slides);
      const fileSize = (fs.statSync(filePath).size / 1024).toFixed(1);
      console.log(`  💾 Saved to ${path.relative(ROOT, filePath)} (${fileSize}KB)`);

      successCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
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
  console.log(`📚 Total: ${chapters.length}`);
  console.log('━'.repeat(50) + '\n');

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
