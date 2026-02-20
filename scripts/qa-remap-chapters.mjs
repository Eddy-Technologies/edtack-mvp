#!/usr/bin/env node
/**
 * QA Chapter Remap Script
 *
 * Reads data/qa/questions.json, maps human-readable chapter names to
 * DB slugs (with the new chapter_12 insertion + 12-17 renumbering),
 * and writes the result back in-place.
 *
 * Usage:
 *   node scripts/qa-remap-chapters.mjs
 *   pnpm qa:remap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA_FILE = path.join(ROOT, 'data', 'qa', 'questions.json');

const SUBJECT_PREFIX = 'o_level_singapore_biology_';

// Map from human-readable chapter names (as they appear in the source JSON)
// to DB chapter slugs (after the renumbering).
const CHAPTER_MAP = {
  'Cell Structure and Organisation': 'chapter_01_cell_structure_and_organization',
  'Cell Structure and Organization': 'chapter_01_cell_structure_and_organization',
  'Movement of Substances': 'chapter_02_movement_of_substances',
  'Biological Molecules: Nutrients': 'chapter_03_biological_molecules',
  'Biological Molecules - Nutrients': 'chapter_03_biological_molecules',
  'Biological Molecules: Enzymes': 'chapter_04_enzymes',
  'Enzymes': 'chapter_04_enzymes',
  'Nutrition in Humans': 'chapter_05_nutrition_in_humans',
  'Transport in Humans': 'chapter_06_transport_in_humans',
  'Respiration in Humans': 'chapter_07_respiration_in_humans',
  'Excretion in Humans': 'chapter_08_excretion_in_humans',
  'Homeostasis': 'chapter_09_homeostasis_and_hormonal_control',
  'Co-ordination and Response: Hormones': 'chapter_09_homeostasis_and_hormonal_control',
  'Co-ordination and Response: The Nervous System': 'chapter_10_the_nervous_system_and_coordination',
  'Co-ordination and Response: Eye': 'chapter_10_the_nervous_system_and_coordination',
  'Coordination and Response: Hormones': 'chapter_09_homeostasis_and_hormonal_control',
  'Coordination and Response: The Nervous System': 'chapter_10_the_nervous_system_and_coordination',
  'Coordination and Response: Eye': 'chapter_10_the_nervous_system_and_coordination',
  'Co-ordination and Response in Humans: Hormones': 'chapter_09_homeostasis_and_hormonal_control',
  'Co-ordination and Response in Humans: The Nervous System': 'chapter_10_the_nervous_system_and_coordination',
  'Co-ordination and Response in Humans: Eye': 'chapter_10_the_nervous_system_and_coordination',
  'Infectious Diseases': 'chapter_11_infectious_diseases_in_humans',
  'Infectious Diseases in Humans': 'chapter_11_infectious_diseases_in_humans',
  // New chapter 12: plants nutrition + transport
  'Nutrition in Plants': 'chapter_12_nutrition_and_transport_in_plants',
  'Transport in Flowering Plants': 'chapter_12_nutrition_and_transport_in_plants',
  'Transport in Plants': 'chapter_12_nutrition_and_transport_in_plants',
  // Renumbered chapters
  'Organisms and their Environment': 'chapter_13_the_ecosystem_and_human_impact',
  'Man and His Environment': 'chapter_13_the_ecosystem_and_human_impact',
  'Man\'s Impact on the Environment': 'chapter_13_the_ecosystem_and_human_impact',
  'Man\'s Impact on their Environment': 'chapter_13_the_ecosystem_and_human_impact',
  'The Ecosystem and Human Impact': 'chapter_13_the_ecosystem_and_human_impact',
  'Molecular Genetics': 'chapter_14_molecular_genetics',
  'Cell Division': 'chapter_15_modes_of_reproduction',
  'Modes of Reproduction': 'chapter_15_modes_of_reproduction',
  'Reproduction in Plants': 'chapter_16_reproduction_in_plants',
  'Reproduction in Humans': 'chapter_17_reproduction_in_humans',
  'Inheritance': 'chapter_18_inheritance',
};

function remap(questions) {
  let remapped = 0;
  let unmapped = new Set();

  const result = questions.map((q) => {
    const raw = q.chapter_id;

    // Already a full DB slug — skip
    if (raw && raw.startsWith(SUBJECT_PREFIX)) {
      remapped++;
      return q;
    }

    const slug = CHAPTER_MAP[raw];
    if (!slug) {
      unmapped.add(raw);
      return q;
    }

    remapped++;
    return { ...q, chapter_id: SUBJECT_PREFIX + slug };
  });

  return { result, remapped, unmapped };
}

// Main
const raw = fs.readFileSync(QA_FILE, 'utf8');
const questions = JSON.parse(raw);

console.log(`\nQA Chapter Remap`);
console.log('─'.repeat(40));
console.log(`Input:  ${questions.length} questions`);

const { result, remapped, unmapped } = remap(questions);

if (unmapped.size > 0) {
  console.warn(`\nWARNING: ${unmapped.size} unmapped chapter name(s):`);
  for (const name of [...unmapped].sort()) {
    console.warn(`  - "${name}"`);
  }
}

fs.writeFileSync(QA_FILE, JSON.stringify(result, null, 2), 'utf8');

console.log(`Remapped: ${remapped} questions`);
console.log(`Written:  ${QA_FILE}`);
console.log('─'.repeat(40) + '\n');

if (unmapped.size > 0) {
  process.exit(1);
}
