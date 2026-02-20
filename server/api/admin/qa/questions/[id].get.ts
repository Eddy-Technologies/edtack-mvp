export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question ID' });
  }

  const question = qaDataStore.getQuestion(id);
  if (!question) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' });
  }

  return {
    success: true,
    data: question,
  };
});
