#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

// Usage: node upload-assets.js [url] [key]
// If args provided, use them. Otherwise fall back to .env
const args = process.argv.slice(2);
const SUPABASE_URL = args[0] || process.env.NUXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = args[1] || process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

// Product images mapping
const PRODUCT_FILES = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png', 'f.png', 'g.png', 'h.png'];

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  return types[ext] || 'application/octet-stream';
}

async function ensureBucket(supabase, bucketName) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === bucketName)) {
    console.log(`Creating ${bucketName} bucket...`);
    const { error } = await supabase.storage.createBucket(bucketName, { public: true });
    if (error) throw error;
  }
}

async function uploadFiles(supabase, bucketName, files, baseDir) {
  let successCount = 0;
  let errorCount = 0;

  for (const fileName of files) {
    const filePath = path.join(baseDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ ${fileName} - File not found`);
      errorCount++;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(filePath),
        upsert: true
      });

    if (error) {
      console.error(`  ✗ ${fileName} - ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ ${fileName}`);
      successCount++;
    }
  }

  return { successCount, errorCount };
}

async function uploadAssets() {
  const supabaseUrl = SUPABASE_URL;
  const supabaseKey = SUPABASE_KEY;

  console.log('Using Supabase URL:', supabaseUrl);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Pass as args: node upload-assets.js <url> <key>');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const assetsDir = path.resolve(__dirname, '../../assets');
  const charactersDir = path.join(assetsDir, 'characters');

  // Upload characters
  if (fs.existsSync(charactersDir)) {
    console.log('\n📁 Uploading characters...');
    await ensureBucket(supabase, 'characters');

    const characterFiles = fs.readdirSync(charactersDir).filter((file) =>
      /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)
    );

    const result = await uploadFiles(supabase, 'characters', characterFiles, charactersDir);
    console.log(`Characters: ${result.successCount} uploaded, ${result.errorCount} failed`);
  } else {
    console.log('\n⚠️  assets/characters directory not found, skipping...');
  }

  // Upload products
  console.log('\n📁 Uploading products...');
  await ensureBucket(supabase, 'products');

  const result = await uploadFiles(supabase, 'products', PRODUCT_FILES, assetsDir);
  console.log(`Products: ${result.successCount} uploaded, ${result.errorCount} failed`);

  console.log('\n✅ Asset upload complete!');
  console.log(`Images available at: ${supabaseUrl}/storage/v1/object/public/`);
}

// Run the upload
uploadAssets().catch((error) => {
  console.error('Upload failed:', error.message);
  process.exit(1);
});
