export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const { imageBase64, placeholder, questionId, cropRect, pageNumber } = body;

  if (!imageBase64 || !placeholder || !questionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: imageBase64, placeholder, questionId',
    });
  }

  // Decode base64 to buffer
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Upload to Supabase Storage
  const supabase = getPrivilegedSupabaseClient(event);
  const bucketName = 'question-images';
  const storagePath = `biology_mcq/${placeholder}.png`;

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b: { name: string }) => b.name === bucketName)) {
    const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });
    if (bucketError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create bucket: ${bucketError.message}`,
      });
    }
  }

  // Upload image
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Upload failed: ${uploadError.message}`,
    });
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  // Update question's diagram_crops
  const question = qaDataStore.getQuestion(questionId);
  if (!question) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' });
  }

  const crops = question.diagram_crops || [];
  const existingIdx = crops.findIndex((c) => c.placeholder === placeholder);
  const cropEntry = {
    placeholder,
    storage_path: storagePath,
    public_url: publicUrl,
    crop_rect: cropRect || { x: 0, y: 0, width: 0, height: 0 },
    page_number: pageNumber || 0,
    created_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    crops[existingIdx] = cropEntry;
  } else {
    crops.push(cropEntry);
  }

  qaDataStore.updateQuestion(questionId, {
    diagram_crops: crops,
    question_image_url: publicUrl,
  });

  return {
    success: true,
    data: {
      public_url: publicUrl,
      storage_path: storagePath,
    },
  };
});
