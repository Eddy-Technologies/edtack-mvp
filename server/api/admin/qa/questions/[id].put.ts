export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question ID' });
  }

  const body = await readBody(event);
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
  }

  // Only allow updating specific fields
  const allowedFields = [
    'chapter_id',
    'difficulty',
    'title',
    'question',
    'explanation',
    'question_image_url',
    'explanation_image_url',
    'has_diagram',
    'options',
    'answer',
    'review_status',
    'review_notes',
    'diagram_crops',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' });
  }

  const updated = qaDataStore.updateQuestion(id, updates);

  return {
    success: true,
    data: updated,
  };
});
