import { readFileSync } from 'node:fs';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const pageParam = getRouterParam(event, 'page');
  const pageNum = parseInt(pageParam || '');

  if (isNaN(pageNum) || pageNum < 1 || pageNum > 999) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid page number' });
  }

  const imagePath = qaDataStore.getPageImagePath(pageNum);
  const imageBuffer = readFileSync(imagePath);

  setResponseHeaders(event, {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=86400',
  });

  return imageBuffer;
});
