export async function useChat(
  apiBase: string,
  body: Record<string, unknown>
): Promise<{ response: any }> {
  try {
    return await $fetch(apiBase, {
      method: 'POST',
      body,
    });
  } catch (error) {
    console.error('Chat request failed:', error);
    throw error;
  }
}
