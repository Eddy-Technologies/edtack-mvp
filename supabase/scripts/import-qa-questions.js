#!/usr/bin/env node
/**
 * Import QA Questions Script
 *
 * Upserts APPROVED questions from data/qa/questions.json into:
 *   questions → question_options → question_correct_answers
 *
 * Requires chapter slugs to already be DB slugs (run pnpm qa:remap first).
 *
 * Usage:
 *   node supabase/scripts/import-qa-questions.js
 *   node supabase/scripts/import-qa-questions.js --dry-run
 *   node supabase/scripts/import-qa-questions.js --chapter chapter_01_cell_structure_and_organization
 *
 * Environment Variables:
 *   NUXT_PUBLIC_SUPABASE_URL  - Supabase URL (falls back to local)
 *   NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY - Service role key
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const QA_FILE = path.join(ROOT, 'data', 'qa', 'questions.json');

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { dryRun: false, chapter: null, help: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') result.dryRun = true;
    else if ((args[i] === '--chapter') && args[i + 1]) result.chapter = args[++i];
    else if (args[i] === '--help' || args[i] === '-h') result.help = true;
  }
  return result;
}

// Load .env file
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

function getConfig() {
  const env = loadEnv();
  return {
    supabaseUrl:
      process.env.NUXT_PUBLIC_SUPABASE_URL ||
      env.NUXT_PUBLIC_SUPABASE_URL ||
      'http://127.0.0.1:54321',
    supabaseServiceKey:
      process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY ||
      env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z2-SBc0',
  };
}

async function importQuestion(supabase, q, dryRun) {
  const questionRow = {
    id: q.id,
    chapter_id: q.chapter_id,
    parent_question_id: q.parent_question_id || null,
    subquestion_order: q.subquestion_order || null,
    part_label: q.part_label || null,
    type: q.type,
    title: q.title,
    question: q.question,
    explanation: q.explanation || null,
    question_image_url: q.question_image_url || null,
    explanation_image_url: q.explanation_image_url || null,
    source_name: q.source_name || '1000_mcqs',
    source_timestamp: q.source_timestamp || new Date().toISOString(),
  };

  if (dryRun) return;

  // Upsert question
  const { error: qErr } = await supabase
    .from('questions')
    .upsert(questionRow, { onConflict: 'id' });
  if (qErr) throw new Error(`questions upsert failed: ${qErr.message}`);

  // Upsert options
  if (q.options && q.options.length > 0) {
    const optionRows = q.options.map((opt) => ({
      id: opt.id,
      question_id: q.id,
      option_text: opt.option_text,
      image_url: opt.image_url || null,
    }));
    const { error: optErr } = await supabase
      .from('question_options')
      .upsert(optionRows, { onConflict: 'id' });
    if (optErr) throw new Error(`question_options upsert failed: ${optErr.message}`);
  }

  // Upsert correct answers
  if (q.answer && q.answer.length > 0) {
    const answerRows = q.answer.map((ans) => ({
      id: ans.id,
      question_id: q.id,
      option_id: ans.option_id || null,
      answer_text: ans.answer_text || null,
      answer_boolean: ans.answer_boolean ?? null,
      answer_draw_file: ans.answer_draw_file || null,
      order_index: ans.order_index || 1,
    }));
    const { error: ansErr } = await supabase
      .from('question_correct_answers')
      .upsert(answerRows, { onConflict: 'id' });
    if (ansErr) throw new Error(`question_correct_answers upsert failed: ${ansErr.message}`);
  }
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(`
Import QA Questions Script

Upserts APPROVED questions from data/qa/questions.json into Supabase.
Run pnpm qa:remap first to ensure chapter_id values are DB slugs.

Usage:
  node supabase/scripts/import-qa-questions.js [options]

Options:
  --dry-run          Preview what would be imported without writing to DB
  --chapter <slug>   Import only questions for a specific chapter slug
  --help, -h         Show this help message

Examples:
  node supabase/scripts/import-qa-questions.js --dry-run
  node supabase/scripts/import-qa-questions.js
  node supabase/scripts/import-qa-questions.js --chapter chapter_01_cell_structure_and_organization
    `);
    process.exit(0);
  }

  const config = getConfig();
  console.log('\nImport QA Questions');
  console.log('─'.repeat(50));
  console.log(`Supabase: ${config.supabaseUrl}`);
  console.log(`Source:   ${QA_FILE}`);
  if (args.chapter) console.log(`Chapter:  ${args.chapter}`);
  console.log(`Dry run:  ${args.dryRun}`);
  console.log('─'.repeat(50));

  const allQuestions = JSON.parse(fs.readFileSync(QA_FILE, 'utf8'));

  // Filter: APPROVED only, and optionally by chapter
  let questions = allQuestions.filter((q) => q.review_status === 'APPROVED');
  if (args.chapter) {
    questions = questions.filter((q) => q.chapter_id && q.chapter_id.includes(args.chapter));
  }

  console.log(`\nTotal in file:  ${allQuestions.length}`);
  console.log(`APPROVED:       ${questions.length}`);
  if (args.chapter) console.log(`After filter:   ${questions.length}`);

  // Validate all have DB-slug chapter_ids
  const SUBJECT_PREFIX = 'o_level_singapore_biology_';
  const nonSlug = questions.filter((q) => !q.chapter_id?.startsWith(SUBJECT_PREFIX));
  if (nonSlug.length > 0) {
    console.error(`\nERROR: ${nonSlug.length} questions have non-slug chapter_id values.`);
    console.error('Run pnpm qa:remap first to convert chapter names to DB slugs.');
    const examples = [...new Set(nonSlug.map((q) => q.chapter_id))].slice(0, 5);
    examples.forEach((e) => console.error(`  - "${e}"`));
    process.exit(1);
  }

  // Chapter breakdown
  const byChapter = {};
  for (const q of questions) {
    byChapter[q.chapter_id] = (byChapter[q.chapter_id] || 0) + 1;
  }
  console.log('\nBy chapter:');
  for (const [ch, count] of Object.entries(byChapter).sort()) {
    console.log(`  ${count.toString().padStart(4)}  ${ch}`);
  }

  if (args.dryRun) {
    console.log('\nDry run complete — no data written.');
    return;
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  let success = 0;
  let errors = 0;

  for (const q of questions) {
    try {
      await importQuestion(supabase, q, false);
      success++;
      if (success % 50 === 0) process.stdout.write(`  ${success}/${questions.length}\r`);
    } catch (err) {
      console.error(`\nERROR [${q.id}] ${q.title}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`Success: ${success}`);
  console.log(`Errors:  ${errors}`);
  console.log(`Total:   ${questions.length}`);
  console.log('─'.repeat(50) + '\n');

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
