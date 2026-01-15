/**
 * Maps character subject codes to chapter subject IDs
 *
 * Characters use simple subject codes (e.g., "BIOLOGY", "CHEMISTRY")
 * while the chapters table uses full subject identifiers (e.g., "o_level_singapore_biology")
 *
 * @param characterSubject - The subject code from a character (e.g., "BIOLOGY")
 * @returns The corresponding subject_id for chapters, or null if no mapping exists
 */
export const mapCharacterSubjectToChapterSubjectId = (characterSubject: string): string | null => {
  const mapping: Record<string, string> = {
    BIOLOGY: 'o_level_singapore_biology',
    CHEMISTRY: 'o_level_singapore_chemistry',
    PHYSICS: 'o_level_singapore_physics',
    MATHEMATICS: 'o_level_singapore_mathematics',
    GENERAL: '', // No chapters for GENERAL subject
  };

  return mapping[characterSubject] ?? null;
};
