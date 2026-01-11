# Lesson JSON Files

This folder contains pre-generated lesson content stored as JSON files.

## Structure

```
lessons/
├── o_level_singapore_biology/
│   ├── o_level_singapore_biology_chapter_01_cell_structure_and_organization.json
│   ├── o_level_singapore_biology_chapter_02_movement_of_substances.json
│   └── ...
├── o_level_singapore_chemistry/
│   └── ...
└── README.md
```

## Usage

### Automatic Import (Local Development)

Lessons are automatically imported when running:
```bash
pnpm db:reset    # Includes import-lessons.js
```

### Generate Lessons (calls Python backend)

```bash
# Generate all chapters for a subject
node supabase/scripts/seed-lessons.js --subject biology

# Generate specific chapter
node supabase/scripts/seed-lessons.js --chapter o_level_singapore_biology_chapter_01_cell_structure_and_organization

# Skip chapters that already have JSON files
node supabase/scripts/seed-lessons.js --subject biology --skip-existing
```

### Import to Database

```bash
# Import all lesson files to database
node supabase/scripts/import-lessons.js

# Import specific subject
node supabase/scripts/import-lessons.js --subject biology

# Skip chapters that already have lessons in DB
node supabase/scripts/import-lessons.js --skip-existing
```

### Import to Dev/Prod

```bash
# Dev
NUXT_PUBLIC_SUPABASE_URL=https://qfzqwbwwzqmacnhtihov.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key> \
node supabase/scripts/import-lessons.js

# Prod
NUXT_PUBLIC_SUPABASE_URL=https://lqgsbofjkfduqcxbmdxn.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key> \
node supabase/scripts/import-lessons.js
```

## File Format

Each JSON file contains an array of slide objects:

```json
[
  {
    "id": "uuid",
    "type": "question",
    "title": "Slide Title",
    "content": "Slide content in markdown",
    "speech_to_text_content": "TTS content",
    "question_type": "LESSON",
    "part_label": "Slide 1",
    "order": 1,
    ...
  }
]
```
