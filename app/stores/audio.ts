import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAudioStore = defineStore('audio', () => {
  const audioBuffer = ref<AudioBuffer | null>(null);
  const audioUrl = ref<string | null>('/out.wav'); // optional URL if you prefer blobs/URLs

  function setAudioUrl(url: string) {
    audioUrl.value = url;
  }

  return {
    audioBuffer,
    audioUrl,
    setAudioUrl,
  };
});
