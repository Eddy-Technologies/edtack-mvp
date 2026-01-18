/**
 * File Upload Types
 * Used for staging files before attaching to chat messages
 */

export type FileUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

export interface StagedFile {
  /** Temporary ID for UI tracking */
  id: string;
  /** Original File object */
  file: File;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Data URL for image preview */
  preview?: string;
  /** Backend ID after successful upload */
  uploadedId?: string;
  /** Current upload status */
  status: FileUploadStatus;
  /** Upload progress (0-100) */
  progress: number;
  /** Error message if upload failed */
  error?: string;
}

export interface UploadedFile {
  file_id: string;
  filename: string;
  mime_type: string;
  file_type: 'image' | 'document' | 'text';
  size_bytes: number;
  upload_timestamp: string;
}

export interface UploadResponse {
  file_ids: string[];
  file_count: number;
  total_size_bytes: number;
  files: UploadedFile[];
  /** Filenames of files that were auto-removed due to limit exceeded */
  auto_removed?: string[];
  /** Filenames of files that were replaced due to duplicate content */
  replaced_duplicates?: string[];
}

export interface ListFilesResponse {
  thread_id: string;
  files: UploadedFile[];
}

export interface DeleteFileResponse {
  message: string;
  file_id: string;
}

export interface FileValidationError {
  file: File;
  error: string;
}

/**
 * Minimal file metadata stored with messages
 * Only includes successfully uploaded files
 */
export interface MessageAttachment {
  /** Backend file ID */
  id: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** When the file was uploaded */
  uploadedAt: string;
}
