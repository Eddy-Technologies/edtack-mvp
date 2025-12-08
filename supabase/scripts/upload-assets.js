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

async function uploadCharacters() {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const charactersDir = path.resolve(__dirname, '../../assets/characters');

  if (!fs.existsSync(charactersDir)) {
    throw new Error('assets/characters directory not found');
  }

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === 'characters')) {
    console.log('Creating characters bucket...');
    const { error } = await supabase.storage.createBucket('characters', { public: true });
    if (error) throw error;
  }

  // Upload all files in characters directory
  const files = fs.readdirSync(charactersDir).filter((file) =>
    /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)
  );

  console.log(`Uploading ${files.length} character assets...`);

  for (const fileName of files) {
    const filePath = path.join(charactersDir, fileName);
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from('characters')
      .upload(fileName, fileBuffer, {
        contentType: getContentType(filePath),
        upsert: true
      });

    if (error) {
      console.error(`Failed to upload ${fileName}:`, error.message);
    } else {
      console.log(`✓ ${fileName}`);
    }
  }

  console.log('Character upload complete!');
}

// Run the upload
uploadCharacters().catch((error) => {
  console.error('Upload failed:', error.message);
  process.exit(1);
});
