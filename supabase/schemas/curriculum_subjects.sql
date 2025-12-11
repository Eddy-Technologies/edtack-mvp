-- Curriculum Subjects Table
-- Junction table linking level_types, syllabus_types, and subjects
-- Defines which subjects are available for each level/syllabus combination
CREATE TABLE curriculum_subjects (
    level_type VARCHAR(50) REFERENCES level_types(level_type),
    syllabus_type VARCHAR(50) REFERENCES syllabus_types(syllabus_type),
    subject VARCHAR(100) REFERENCES subjects(name),
    CONSTRAINT pk_curriculum_subjects PRIMARY KEY (level_type, syllabus_type, subject)
);