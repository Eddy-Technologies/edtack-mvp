import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAudioStore = defineStore('audio', () => {
  const audioBuffer = ref<AudioBuffer | null>(null);
  const audioUrl = ref<string | null>('/out.wav'); // optional URL if you prefer blobs/URLs

  function setAudioBuffer(buffer: AudioBuffer) {
    audioBuffer.value = buffer;
  }

  function setAudioUrl(url: string) {
    audioUrl.value = url;
  }

  function clearAudio() {
    audioBuffer.value = null;
    audioUrl.value = null;
  }

  return {
    audioBuffer,
    audioUrl,
    setAudioUrl,
  };
});
