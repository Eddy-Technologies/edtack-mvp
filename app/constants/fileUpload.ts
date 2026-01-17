/**
 * File Upload Configuration Constants
 */

export const FILE_UPLOAD_CONFIG = {
  /** Maximum file size per file (10 MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  /** Maximum total size across all files (50 MB) */
  MAX_TOTAL_SIZE: 50 * 1024 * 1024,

  /** Maximum number of files per upload */
  MAX_FILES: 10,

  /** Accepted MIME types */
  ACCEPTED_TYPES: [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    // Text
    'text/plain',
    'text/markdown',
  ],

  /** Human-readable accepted file description */
  ACCEPTED_DESCRIPTION: 'Images (JPEG, PNG, GIF, WebP), PDF, or text files',

  /** File input accept attribute */
  ACCEPT_ATTRIBUTE: '.jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md',
} as const;

/**
 * Format bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if MIME type is an image
 */
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if MIME type is a PDF
 */
export function isPdfType(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType: string): 'image' | 'document' | 'text' {
  if (isImageType(mimeType)) return 'image';
  if (isPdfType(mimeType)) return 'document';
  return 'text';
}
