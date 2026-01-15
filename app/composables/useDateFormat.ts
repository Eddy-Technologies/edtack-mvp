/**
 * Date formatting composable for consistent date display across the application.
 * All dates are displayed in dd/mm/yyyy format unless otherwise specified.
 */

/**
 * Safely parses a date string or Date object into a Date instance.
 *
 * @param date - The date to parse (string, Date, null, or undefined)
 * @returns A valid Date object or null if parsing fails
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

/**
 * Pads a number with leading zero if it's single digit.
 *
 * @param num - The number to pad
 * @returns Padded string (e.g., 5 -> "05", 12 -> "12")
 */
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Date formatting composable providing consistent date formatting functions.
 */
export function useDateFormat() {
  /**
   * Formats a date as dd/mm/yyyy.
   *
   * @param date - The date to format
   * @returns Formatted date string or 'N/A' if date is invalid
   *
   * @example
   * formatDate('2026-01-15') // Returns "15/01/2026"
   * formatDate(null) // Returns "N/A"
   */
  function formatDate(date: string | Date | null | undefined): string {
    const parsedDate = parseDate(date);

    if (!parsedDate) return 'N/A';

    const day = padZero(parsedDate.getDate());
    const month = padZero(parsedDate.getMonth() + 1); // Months are 0-indexed
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Formats a date as dd/mm/yyyy HH:mm (24-hour format).
   *
   * @param date - The date to format
   * @returns Formatted date and time string or 'N/A' if date is invalid
   *
   * @example
   * formatDateWithTime('2026-01-15T14:30:00') // Returns "15/01/2026 14:30"
   * formatDateWithTime(null) // Returns "N/A"
   */
  function formatDateWithTime(date: string | Date | null | undefined): string {
    const parsedDate = parseDate(date);

    if (!parsedDate) return 'N/A';

    const day = padZero(parsedDate.getDate());
    const month = padZero(parsedDate.getMonth() + 1);
    const year = parsedDate.getFullYear();
    const hours = padZero(parsedDate.getHours());
    const minutes = padZero(parsedDate.getMinutes());

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Formats a date as a relative time string ("Just now", "2h ago", "3d ago")
   * with fallback to dd/mm/yyyy for dates older than 7 days.
   *
   * @param date - The date to format
   * @param fallbackToAbsolute - If true, shows dd/mm/yyyy for old dates. If false, shows absolute date always after relative threshold
   * @returns Formatted relative or absolute date string
   *
   * @example
   * formatDateRelative('2026-01-15T14:00:00') // Returns "Just now" if within 1 hour
   * formatDateRelative('2026-01-15T10:00:00') // Returns "4h ago" if 4 hours old
   * formatDateRelative('2026-01-10T10:00:00') // Returns "5d ago" if 5 days old
   * formatDateRelative('2025-12-01T10:00:00') // Returns "15/12/2025" if older than 7 days
   */
  function formatDateRelative(
    date: string | Date | null | undefined,
    fallbackToAbsolute: boolean = true
  ): string {
    const parsedDate = parseDate(date);

    if (!parsedDate) return 'N/A';

    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    // Less than 1 hour ago
    if (diffHours < 1) {
      return 'Just now';
    }

    // Less than 24 hours ago
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    // Less than 7 days ago
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // Older than 7 days - show absolute date
    if (fallbackToAbsolute) {
      return formatDate(parsedDate);
    }

    return formatDate(parsedDate);
  }

  return {
    formatDate,
    formatDateWithTime,
    formatDateRelative,
    parseDate,
  };
}
