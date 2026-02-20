export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);

  const filters = {
    chapter: query.chapter as string | undefined,
    status: query.status as 'PENDING' | 'APPROVED' | 'FLAGGED' | undefined,
    hasDiagram: query.hasDiagram === 'true' ? true : query.hasDiagram === 'false' ? false : undefined,
    needsCrop: query.needsCrop === 'true' ? true : undefined,
    search: query.search as string | undefined,
    page: query.page ? parseInt(query.page as string) : 1,
    pageSize: query.pageSize ? parseInt(query.pageSize as string) : 50,
  };

  const result = qaDataStore.listQuestions(filters);
  const chapters = qaDataStore.getAllChapters();

  return {
    success: true,
    data: result.items,
    total: result.total,
    stats: result.stats,
    chapters,
  };
});
