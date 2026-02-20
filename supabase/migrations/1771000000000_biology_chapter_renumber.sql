-- Biology Chapter Renumber Migration
-- Inserts new chapter 12 "Nutrition and Transport in Plants"
-- and shifts old chapters 12-17 up to 13-18.
--
-- Strategy: Drop FKs → rename chapters (reverse order) → insert new chapter 12 → re-add FKs
-- No user data references these chapters yet, so no child-row updates needed.

-- Step 1: Drop FK constraints that reference chapters(name)
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_chapter_id_fkey;
ALTER TABLE user_tasks_chapters DROP CONSTRAINT IF EXISTS user_tasks_chapters_chapter_name_fkey;

-- Step 2: Rename existing chapters in reverse order to avoid PK conflicts
UPDATE chapters SET name = 'o_level_singapore_biology_chapter_18_inheritance',     sort_order = 18 WHERE name = 'o_level_singapore_biology_chapter_17_inheritance';
UPDATE chapters SET name = 'o_level_singapore_biology_chapter_17_reproduction_in_humans', sort_order = 17 WHERE name = 'o_level_singapore_biology_chapter_16_reproduction_in_humans';
UPDATE chapters SET name = 'o_level_singapore_biology_chapter_16_reproduction_in_plants',  sort_order = 16 WHERE name = 'o_level_singapore_biology_chapter_15_reproduction_in_plants';
UPDATE chapters SET name = 'o_level_singapore_biology_chapter_15_modes_of_reproduction',   sort_order = 15 WHERE name = 'o_level_singapore_biology_chapter_14_modes_of_reproduction';
UPDATE chapters SET name = 'o_level_singapore_biology_chapter_14_molecular_genetics',       sort_order = 14 WHERE name = 'o_level_singapore_biology_chapter_13_molecular_genetics';
UPDATE chapters SET name = 'o_level_singapore_biology_chapter_13_the_ecosystem_and_human_impact', sort_order = 13 WHERE name = 'o_level_singapore_biology_chapter_12_the_ecosystem_and_human_impact';

-- Step 3: Insert new chapter 12 (ON CONFLICT DO NOTHING so seeds can also insert it on db:reset)
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_biology_chapter_12_nutrition_and_transport_in_plants',
 'Nutrition and Transport in Plants',
 'o_level_singapore_biology',
 1,
 'Photosynthesis, mineral nutrition, and transport systems in flowering plants',
 12)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Re-add FK constraints
ALTER TABLE questions
  ADD CONSTRAINT questions_chapter_id_fkey
  FOREIGN KEY (chapter_id) REFERENCES chapters(name) ON DELETE CASCADE;

ALTER TABLE user_tasks_chapters
  ADD CONSTRAINT user_tasks_chapters_chapter_name_fkey
  FOREIGN KEY (chapter_name) REFERENCES chapters(name) ON DELETE CASCADE;
