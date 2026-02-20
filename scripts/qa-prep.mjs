#!/usr/bin/env node
/**
 * QA Prep Script
 * 1. Copies biology MCQ JSON from anthopic-rag, adds review fields
 * 2. Renders PDF pages 9-194 as JPEG via Python pdf2image
 *
 * Usage: pnpm qa:prep
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const SOURCE_JSON = resolve(
  process.env.HOME,
  'Projects/anthopic-rag/data/extracted/biology_1000_mcqs_vision.json'
);
const PDF_PATH = resolve(process.env.HOME, 'Downloads/1000_mcqs.pdf');
const PYTHON_BIN = resolve(process.env.HOME, 'Projects/anthopic-rag/venv/bin/python');

const OUT_DIR = resolve(import.meta.dirname, '..', 'data/qa');
const PAGES_DIR = resolve(OUT_DIR, 'pages');
const OUT_JSON = resolve(OUT_DIR, 'questions.json');

// Page range for question pages in the PDF
const PAGE_START = 9;
const PAGE_END = 194;

console.log('=== QA Prep Script ===\n');

// 1. Create directories
mkdirSync(PAGES_DIR, { recursive: true });
console.log(`Created ${OUT_DIR}`);

// 2. Copy and augment JSON
console.log(`\nReading source JSON from ${SOURCE_JSON}...`);
const raw = readFileSync(SOURCE_JSON, 'utf-8');
const questions = JSON.parse(raw);

let augmented = 0;
for (const q of questions) {
  if (!q.review_status) {
    q.review_status = 'PENDING';
    q.review_notes = '';
    q.diagram_crops = [];
    augmented++;
  }
}

writeFileSync(OUT_JSON, JSON.stringify(questions, null, 2));
console.log(
  `Wrote ${questions.length} questions to ${OUT_JSON} (${augmented} newly augmented)`
);

// 3. Check if pages already rendered
const firstPage = resolve(PAGES_DIR, `page_${String(PAGE_START).padStart(3, '0')}.jpg`);
const lastPage = resolve(PAGES_DIR, `page_${String(PAGE_END).padStart(3, '0')}.jpg`);

if (existsSync(firstPage) && existsSync(lastPage)) {
  console.log('\nPage images already exist, skipping PDF rendering.');
  console.log('Delete data/qa/pages/ to re-render.');
} else {
  // 4. Render PDF pages via Python
  console.log(`\nRendering PDF pages ${PAGE_START}-${PAGE_END} as JPEG...`);
  console.log(`PDF: ${PDF_PATH}`);
  console.log(`Python: ${PYTHON_BIN}`);

  const pythonScript = `import sys
from pdf2image import convert_from_path
import os

pdf_path = "${PDF_PATH}"
out_dir = "${PAGES_DIR}"
page_start = ${PAGE_START}
page_end = ${PAGE_END}

print(f"Converting pages {page_start}-{page_end}...")
images = convert_from_path(
    pdf_path,
    first_page=page_start,
    last_page=page_end,
    dpi=150,
    fmt="jpeg",
    jpegopt={"quality": 85}
)

for i, img in enumerate(images):
    page_num = page_start + i
    filename = f"page_{page_num:03d}.jpg"
    filepath = os.path.join(out_dir, filename)
    img.save(filepath, "JPEG")
    if (i + 1) % 20 == 0 or i == 0 or i == len(images) - 1:
        print(f"  Saved {filename} ({i+1}/{len(images)})")

print(f"Done! {len(images)} pages rendered.")
`;

  const tmpScript = join(tmpdir(), 'qa_render_pages.py');
  try {
    writeFileSync(tmpScript, pythonScript);
    execSync(`${PYTHON_BIN} ${tmpScript}`, {
      stdio: 'inherit',
      timeout: 300_000 // 5 minutes
    });
  } catch (err) {
    console.error('Failed to render PDF pages:', err.message);
    process.exit(1);
  } finally {
    try {
      unlinkSync(tmpScript);
    } catch {
      // ignore cleanup errors
    }
  }
}

console.log('\n=== QA Prep Complete ===');
console.log(`Questions: ${OUT_JSON}`);
console.log(`Pages: ${PAGES_DIR}/`);
