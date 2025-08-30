import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
  // State is now a function that returns a plain object, do not use 'ref' or 'reactive' directly
  state: () => ({
    thread_id: 'new' as string,
  }),
  actions: {
    setThreadId(thread_id: string) {
      this.thread_id = thread_id;
    },
    clear() {
      this.thread_id = 'new';
    },
  },
});
