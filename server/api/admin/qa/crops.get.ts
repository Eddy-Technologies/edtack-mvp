export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const crops = qaDataStore.getAllCrops();

  return {
    success: true,
    data: crops,
  };
});
