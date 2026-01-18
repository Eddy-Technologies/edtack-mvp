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

/**
 * Image compression configuration
 */
export const IMAGE_COMPRESSION_CONFIG = {
  /** Max dimension (width or height) for compressed images */
  MAX_DIMENSION: 2048,
  /** JPEG quality (0-1) */
  QUALITY: 0.85,
  /** Only compress if file exceeds this size (2MB) */
  COMPRESS_THRESHOLD: 2 * 1024 * 1024,
} as const;

/**
 * Compress an image file to reduce size
 * Returns the original file if compression is not needed or fails
 */
export async function compressImage(file: File): Promise<File> {
  // Only compress images
  if (!isImageType(file.type)) {
    return file;
  }

  // Skip small files
  if (file.size < IMAGE_COMPRESSION_CONFIG.COMPRESS_THRESHOLD) {
    return file;
  }

  try {
    // Create image element
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    // Calculate new dimensions
    let { width, height } = img;
    const maxDim = IMAGE_COMPRESSION_CONFIG.MAX_DIMENSION;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', IMAGE_COMPRESSION_CONFIG.QUALITY);
    });

    if (!blob) {
      return file;
    }

    // Only use compressed version if it's smaller
    if (blob.size >= file.size) {
      return file;
    }

    // Create new file with original name but .jpg extension for compressed
    const newName = file.name.replace(/\.[^.]+$/, '.jpg');
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (error) {
    console.warn('[compressImage] Compression failed, using original:', error);
    return file;
  }
}
