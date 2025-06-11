export async function useChat(
  apiBase: string,
  body: Record<string, unknown>
): Promise<{ message: string; updatedSummary?: string }> {
  try {
    const response = await $fetch(apiBase, {
      method: 'POST',
      body,
    });

    // Return the entire response object with message and updatedSummary
    return response as { message: string; updatedSummary?: string };
  } catch (error) {
    console.error('Chat request failed:', error);
    throw error;
  }
}
