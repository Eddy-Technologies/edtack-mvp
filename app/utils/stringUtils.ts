/**
 * Converts CONSTANT_CASE strings to Title Case
 * Examples:
 * - "GENERAL" → "General"
 * - "PURE_BIOLOGY" → "Pure Biology"
 * - "ADDITIONAL_MATHEMATICS" → "Additional Mathematics"
 */
export function constantCaseToTitleCase(str: string | null | undefined): string {
  if (!str) return '';

  return str
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
