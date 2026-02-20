# QA Review Tool

An internal admin tool for reviewing and correcting AI-extracted MCQ questions before importing them into the database.

## Overview

The tool lives at `/admin?tab=qa-review` and provides:
- Side-by-side PDF viewer + question editor
- Question navigation with filters (chapter, status, diagram)
- Inline editing of question text, options, correct answer, explanation
- Diagram crop upload to Supabase Storage
- Approve / Flag workflow
- Progress bar (approved / total)

Data is stored locally in `data/qa/questions.json` (gitignored) while under review, then migrated to Supabase once complete.

---

## Setup

### 1. Generate QA data

```bash
pnpm qa:prep
```

This reads the source extraction JSON and PDF, writes `data/qa/questions.json` and renders PDF page images to `data/qa/pages/`.

**Source files (hardcoded in `scripts/qa-prep.mjs`):**
- JSON: `~/Projects/anthopic-rag/data/extracted/biology_1000_mcqs_vision.json`
- PDF: `~/Downloads/1000_mcqs.pdf`
- Python venv: `~/Projects/anthopic-rag/venv/bin/python`

### 2. Start the dev server

```bash
pnpm dev
```

Navigate to `http://localhost:3000/admin?tab=qa-review`.

---

## Workflow

1. Filter questions by chapter / status / diagram flag
2. For each question:
   - Edit text, options, explanation as needed
   - Set the correct answer radio button
   - If `has_diagram`, crop the diagram from the PDF viewer and upload to Supabase Storage
   - Click **Approve** to mark as `APPROVED` and advance, or **Flag** to mark for later
3. Changes auto-save to `data/qa/questions.json` (2 s debounce)

---

## Data Migration

Once review is complete, import approved questions into Supabase:

```bash
# Dry run — prints counts, writes nothing
pnpm qa:import -- --dry-run

# Import APPROVED questions only (default)
pnpm qa:import

# Import all questions regardless of review status
pnpm qa:import -- --all

# Target a specific environment by passing URL + key
node supabase/scripts/import-qa-questions.js \
  https://qfzqwbwwzqmacnhtihov.supabase.co \
  <dev-service-role-key>
```

The script upserts into three tables in order (respecting FK constraints):
1. `questions`
2. `question_options`
3. `question_correct_answers`

Upsert is idempotent — safe to re-run. Questions that already exist are updated.

**Fields NOT migrated** (QA-tool-only):
- `review_status`, `review_notes`, `diagram_crops`, `has_diagram`

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/qa-prep.mjs` | Generate `data/qa/` from source JSON + PDF |
| `supabase/scripts/import-qa-questions.js` | Migrate reviewed questions to Supabase |
| `data/qa/questions.json` | Local review store (gitignored) |
| `data/qa/pages/page_NNN.jpg` | PDF page images for the viewer (gitignored) |
| `server/utils/qaDataStore.ts` | Server singleton — reads/writes `questions.json` |
| `server/api/admin/qa/` | API routes (list, get, update, crops) |
| `app/composables/useQAReview.ts` | Frontend state composable |
| `app/components/admin/QAReviewTab.vue` | Tab root |
| `app/components/admin/qa/QuestionNav.vue` | Left panel — question list + filters |
| `app/components/admin/qa/QuestionEditor.vue` | Right panel — editor |
| `app/components/admin/qa/PdfViewer.vue` | PDF page viewer with crop tool |

---

## Adding a Similar Tool

Follow the Admin Tab Pattern (see `MEMORY.md`):
1. Add nav item to `managementItems` in `app/components/admin/Layout.vue`
2. Add `v-else-if` + import to `app/pages/admin/index.vue`
3. If full-width layout needed, add tab name to `isFullWidthTab` computed

For a local JSON data store (like this tool), copy `server/utils/qaDataStore.ts` and adapt the schema. For production data, use `getPrivilegedSupabaseClient(event)` in API routes instead.
