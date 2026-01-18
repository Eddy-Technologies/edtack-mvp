import { ref, computed } from 'vue';
import type { StagedFile, UploadResponse } from '~/types/fileUpload';
import { FILE_UPLOAD_CONFIG, getFileUploadConfig, formatFileSize, isImageType } from '~/constants/fileUpload';
import { getSupabaseAccessToken } from '~/utils/authToken';

/**
 * Composable for managing file uploads in chat
 * Files are staged locally, uploaded to backend, and auto-attached to next message
 */
export function useFileUpload(threadId: Ref<string>) {
  // Get config with runtime values (from env vars)
  const config = getFileUploadConfig();

  // State
  const stagedFiles = ref<StagedFile[]>([]);
  const isUploading = ref(false);
  const uploadError = ref<string | null>(null);

  // Backend response info (auto-removed files, replaced duplicates)
  const lastAutoRemoved = ref<string[]>([]);
  const lastReplacedDuplicates = ref<string[]>([]);

  // Drag-drop state
  const isDragging = ref(false);
  let dragCounter = 0;

  // Computed
  const hasFiles = computed(() => stagedFiles.value.length > 0);
  const totalSize = computed(() => stagedFiles.value.reduce((sum, f) => sum + f.size, 0));
  const allUploaded = computed(() => stagedFiles.value.every((f) => f.status === 'uploaded'));
  const hasErrors = computed(() => stagedFiles.value.some((f) => f.status === 'error'));
  const uploadedFileIds = computed(() =>
    stagedFiles.value
      .filter((f) => f.uploadedId)
      .map((f) => f.uploadedId as string)
  );
  // For UI display of limit info
  const maxFiles = computed(() => config.MAX_FILES);
  const maxFileSize = computed(() => config.MAX_FILE_SIZE);
  const maxTotalSize = computed(() => config.MAX_TOTAL_SIZE);

  /**
   * Generate a unique ID for staging
   */
  function generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create preview for image files
   */
  async function createImagePreview(file: File): Promise<string | undefined> {
    if (!isImageType(file.type)) return undefined;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate a single file
   */
  function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File exceeds ${formatFileSize(config.MAX_FILE_SIZE)} limit`,
      };
    }

    // Check file type
    if (!FILE_UPLOAD_CONFIG.ACCEPTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported',
      };
    }

    // Check total size
    if (totalSize.value + file.size > config.MAX_TOTAL_SIZE) {
      return {
        valid: false,
        error: `Total upload size would exceed ${formatFileSize(config.MAX_TOTAL_SIZE)}`,
      };
    }

    // Check file count (client-side limit before upload)
    if (stagedFiles.value.length >= config.MAX_FILES) {
      return {
        valid: false,
        error: `Maximum ${config.MAX_FILES} files allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Add files to staging area
   */
  async function addFiles(files: File[]): Promise<{ added: number; errors: string[] }> {
    const errors: string[] = [];
    let added = 0;

    console.log('[useFileUpload] addFiles called:', files.map((f) => ({ name: f.name, type: f.type, size: f.size })));

    for (const file of files) {
      const validation = validateFile(file);

      if (!validation.valid) {
        console.log('[useFileUpload] Validation failed for', file.name, ':', validation.error);
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Create preview for images
      const preview = await createImagePreview(file);

      // Add to staged files
      const stagedFile: StagedFile = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        status: 'pending',
        progress: 0,
      };

      stagedFiles.value.push(stagedFile);
      added++;
    }

    // Auto-upload after adding (only if we have a threadId)
    if (added > 0 && threadId.value) {
      uploadFiles();
    }

    return { added, errors };
  }

  /**
   * Remove a file from staging
   */
  async function removeFile(fileId: string): Promise<void> {
    const fileIndex = stagedFiles.value.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) return;

    const file = stagedFiles.value[fileIndex];

    // If already uploaded, delete from backend
    if (file.uploadedId) {
      try {
        const token = await getSupabaseAccessToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        await $fetch(`/api/chat/${threadId.value}/files/${file.uploadedId}`, {
          method: 'DELETE',
          headers,
        });
      } catch (err) {
        console.error('[useFileUpload] Failed to delete from backend:', err);
        // Continue with local removal anyway
      }
    }

    // Remove from local state
    stagedFiles.value.splice(fileIndex, 1);
  }

  /**
   * Clear all staged files
   */
  async function clearFiles(): Promise<void> {
    // Get auth token once for all delete requests
    const token = await getSupabaseAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Delete uploaded files from backend
    for (const file of stagedFiles.value) {
      if (file.uploadedId) {
        try {
          await $fetch(`/api/chat/${threadId.value}/files/${file.uploadedId}`, {
            method: 'DELETE',
            headers,
          });
        } catch (err) {
          console.error('[useFileUpload] Failed to delete from backend:', err);
        }
      }
    }

    stagedFiles.value = [];
  }

  // Track retry attempts to prevent infinite loops
  let uploadRetryCount = 0;
  const MAX_UPLOAD_RETRIES = 1;

  /**
   * Upload pending files to backend
   */
  async function uploadFiles(): Promise<boolean> {
    console.log('[useFileUpload] uploadFiles called, threadId:', threadId.value, 'stagedFiles:', stagedFiles.value.length);

    // Don't upload if no threadId (for new chats, files stay pending)
    if (!threadId.value) {
      console.log('[useFileUpload] No threadId, skipping upload');
      return true;
    }

    const pendingFiles = stagedFiles.value.filter((f) => f.status === 'pending');
    console.log('[useFileUpload] Pending files to upload:', pendingFiles.length, 'statuses:', stagedFiles.value.map((f) => f.status));
    if (pendingFiles.length === 0) return true;

    isUploading.value = true;
    uploadError.value = null;

    // Mark files as uploading
    pendingFiles.forEach((f) => {
      f.status = 'uploading';
      f.progress = 0;
    });

    try {
      // Get fresh auth token
      const token = await getSupabaseAccessToken();

      // Create FormData
      const formData = new FormData();
      pendingFiles.forEach((f) => {
        formData.append('files', f.file);
      });

      // Build headers with auth token
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Upload to backend
      const response = await $fetch<UploadResponse>(
        `/api/chat/${threadId.value}/files/upload`,
        {
          method: 'POST',
          body: formData,
          headers,
        }
      );

      // Update staged files with backend IDs
      console.log('[useFileUpload] Upload response:', response);

      // Track auto-removed and replaced files for UI feedback
      lastAutoRemoved.value = response.auto_removed || [];
      lastReplacedDuplicates.value = response.replaced_duplicates || [];

      if (lastAutoRemoved.value.length > 0) {
        console.log('[useFileUpload] Backend auto-removed oldest files:', lastAutoRemoved.value);
      }
      if (lastReplacedDuplicates.value.length > 0) {
        console.log('[useFileUpload] Backend replaced duplicates:', lastReplacedDuplicates.value);
      }

      if (response.files && response.files.length > 0) {
        response.files.forEach((uploadedFile, index) => {
          if (pendingFiles[index]) {
            pendingFiles[index].uploadedId = uploadedFile.file_id;
            pendingFiles[index].status = 'uploaded';
            pendingFiles[index].progress = 100;
            console.log('[useFileUpload] File uploaded:', uploadedFile.file_id, pendingFiles[index].name);
          }
        });
      } else {
        // Backend returned success but no files (deduplication/already exists)
        // Mark files as uploaded anyway so UI doesn't stay in loading state
        console.log('[useFileUpload] Backend returned no files (deduplication?), marking as uploaded');
        pendingFiles.forEach((f) => {
          f.status = 'uploaded';
          f.progress = 100;
        });
      }

      return true;
    } catch (err: any) {
      console.error('[useFileUpload] Upload failed:', err);
      const errorMessage = err.data?.message || err.message || 'Upload failed';

      // Auto-recover from file limit errors (retry once)
      if ((errorMessage.includes('Maximum file limit') || errorMessage.includes('file limit')) && uploadRetryCount < MAX_UPLOAD_RETRIES) {
        console.log('[useFileUpload] File limit hit, auto-clearing backend and retrying...');
        uploadRetryCount++;

        // Reset files to pending for retry
        pendingFiles.forEach((f) => {
          f.status = 'pending';
          f.progress = 0;
        });

        // Clear all backend files and retry
        await clearAllBackendFiles();
        isUploading.value = false; // Reset before recursive call

        const result = await uploadFiles(); // Retry upload
        uploadRetryCount = 0; // Reset counter on success or final failure
        return result;
      }

      uploadRetryCount = 0; // Reset counter on other errors

      uploadError.value = errorMessage;

      // Mark files as error
      pendingFiles.forEach((f) => {
        f.status = 'error';
        f.error = 'Upload failed';
      });

      return false;
    } finally {
      isUploading.value = false;
    }
  }

  /**
   * Retry uploading failed files
   */
  async function retryUpload(fileId: string): Promise<void> {
    const file = stagedFiles.value.find((f) => f.id === fileId);
    if (!file || file.status !== 'error') return;

    file.status = 'pending';
    file.error = undefined;
    file.progress = 0;

    await uploadFiles();
  }

  /**
   * Clear ALL staged files from backend (even ones not in local state)
   * Use this to recover from stuck files or limit errors
   */
  async function clearAllBackendFiles(): Promise<void> {
    if (!threadId.value) return;

    try {
      const token = await getSupabaseAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // List all staged files from backend
      const response = await $fetch<{ files: Array<{ file_id: string }> }>(
        `/api/chat/${threadId.value}/files`,
        { headers }
      );

      if (response?.files?.length > 0) {
        console.log('[useFileUpload] Clearing', response.files.length, 'backend staged files');

        // Delete all files in parallel
        await Promise.all(
          response.files.map((file) =>
            $fetch(`/api/chat/${threadId.value}/files/${file.file_id}`, {
              method: 'DELETE',
              headers,
            }).catch((err) => {
              console.error('[useFileUpload] Failed to delete:', file.file_id, err);
            })
          )
        );
      }
    } catch (err) {
      console.error('[useFileUpload] Failed to clear backend files:', err);
    }
  }

  /**
   * Clear files after message is sent - deletes from backend too
   */
  async function clearAfterSend(): Promise<void> {
    // Get auth token once for all delete requests
    const token = await getSupabaseAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Delete uploaded files from backend (in parallel for speed)
    const deletePromises = stagedFiles.value
      .filter((f) => f.uploadedId)
      .map((file) =>
        $fetch(`/api/chat/${threadId.value}/files/${file.uploadedId}`, {
          method: 'DELETE',
          headers,
        }).catch((err) => {
          console.error('[useFileUpload] Failed to delete from backend:', file.uploadedId, err);
        })
      );

    await Promise.all(deletePromises);

    // Clear local state
    stagedFiles.value = [];
  }

  // Drag-drop handlers
  function handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer?.types.includes('Files')) {
      isDragging.value = true;
    }
  }

  function handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      isDragging.value = false;
    }
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  async function handleDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    dragCounter = 0;
    isDragging.value = false;

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      await addFiles(files);
    }
  }

  /**
   * Clear the last auto-removed/replaced info
   * Call this after displaying the feedback to the user
   */
  function clearUploadFeedback(): void {
    lastAutoRemoved.value = [];
    lastReplacedDuplicates.value = [];
  }

  return {
    // State
    stagedFiles,
    isUploading,
    uploadError,
    isDragging,

    // Backend feedback (auto-removed files, deduplication)
    lastAutoRemoved,
    lastReplacedDuplicates,

    // Computed
    hasFiles,
    totalSize,
    allUploaded,
    hasErrors,
    uploadedFileIds,

    // Config limits (for UI display)
    maxFiles,
    maxFileSize,
    maxTotalSize,

    // Actions
    addFiles,
    removeFile,
    clearFiles,
    clearAllBackendFiles,
    uploadFiles,
    retryUpload,
    clearAfterSend,
    clearUploadFeedback,

    // Drag-drop handlers
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
