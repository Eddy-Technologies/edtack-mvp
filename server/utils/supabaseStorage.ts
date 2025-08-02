import { createClient } from '@supabase/supabase-js';

const supabaseUrl = useRuntimeConfig().public.supabaseUrl;
const supabaseKey = useRuntimeConfig().supabaseServiceKey || useRuntimeConfig().public.supabaseAnonKey;

export const storageClient = createClient(supabaseUrl, supabaseKey);

export const STORAGE_BUCKETS = {
  CHARACTERS: 'characters',
  AVATARS: 'avatars',
  PRODUCTS: 'products',
  DOCUMENTS: 'documents'
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob | Buffer,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) {
  const { data, error } = await storageClient.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType,
      upsert: options?.upsert || false
    });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to upload file: ${error.message}`
    });
  }

  return data;
}

/**
 * Get public URL for a file in Supabase Storage
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = storageClient.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, path: string) {
  const { data, error } = await storageClient.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete file: ${error.message}`
    });
  }

  return data;
}

/**
 * List files in a bucket
 */
export async function listFiles(
  bucket: StorageBucket,
  path?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
) {
  const { data, error } = await storageClient.storage
    .from(bucket)
    .list(path, {
      limit: options?.limit,
      offset: options?.offset,
      sortBy: options?.sortBy
    });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to list files: ${error.message}`
    });
  }

  return data;
}

/**
 * Create storage buckets if they don't exist
 */
export async function initializeStorageBuckets() {
  const buckets = Object.values(STORAGE_BUCKETS);

  for (const bucket of buckets) {
    const { error } = await storageClient.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });

    if (error && !error.message.includes('already exists')) {
      console.error(`Failed to create bucket ${bucket}:`, error);
    }
  }
}

/**
 * Upload character media files (images, gifs, audio)
 */
export async function uploadCharacterMedia(
  characterId: number,
  files: {
    image?: File | Buffer;
    idleGif?: File | Buffer;
    talkingGif?: File | Buffer;
    thinkingGif?: File | Buffer;
    voiceAudio?: File | Buffer;
  }
) {
  const uploads: { [key: string]: string } = {};

  if (files.image) {
    const imagePath = `${characterId}/image.png`;
    await uploadFile(STORAGE_BUCKETS.CHARACTERS, imagePath, files.image, {
      contentType: 'image/png',
      upsert: true
    });
    uploads.image_url = getPublicUrl(STORAGE_BUCKETS.CHARACTERS, imagePath);
  }

  if (files.idleGif) {
    const idlePath = `${characterId}/idle.gif`;
    await uploadFile(STORAGE_BUCKETS.CHARACTERS, idlePath, files.idleGif, {
      contentType: 'image/gif',
      upsert: true
    });
    uploads.idle_gif_url = getPublicUrl(STORAGE_BUCKETS.CHARACTERS, idlePath);
  }

  if (files.talkingGif) {
    const talkingPath = `${characterId}/talking.gif`;
    await uploadFile(STORAGE_BUCKETS.CHARACTERS, talkingPath, files.talkingGif, {
      contentType: 'image/gif',
      upsert: true
    });
    uploads.talking_gif_url = getPublicUrl(STORAGE_BUCKETS.CHARACTERS, talkingPath);
  }

  if (files.thinkingGif) {
    const thinkingPath = `${characterId}/thinking.gif`;
    await uploadFile(STORAGE_BUCKETS.CHARACTERS, thinkingPath, files.thinkingGif, {
      contentType: 'image/gif',
      upsert: true
    });
    uploads.thinking_gif_url = getPublicUrl(STORAGE_BUCKETS.CHARACTERS, thinkingPath);
  }

  if (files.voiceAudio) {
    const voicePath = `${characterId}/voice_sample.mp3`;
    await uploadFile(STORAGE_BUCKETS.CHARACTERS, voicePath, files.voiceAudio, {
      contentType: 'audio/mpeg',
      upsert: true
    });
    uploads.voice_sample_url = getPublicUrl(STORAGE_BUCKETS.CHARACTERS, voicePath);
  }

  return uploads;
}
