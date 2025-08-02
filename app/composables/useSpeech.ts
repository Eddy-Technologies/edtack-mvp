import { ref, onUnmounted } from 'vue';
import { useAudioStore } from '~/stores/audio';

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export function useSpeech() {
  const audioStore = useAudioStore();
  const isSpeaking = ref(false);
  const isLoadingTTS = ref(false);
  let currentAudioUrl: string | null = null;

  let speechEndCallback: (() => void) | null = null;

  function onSpeechEnd(cb: () => void) {
    speechEndCallback = cb;
  }

  const speakLastAssistantMessage = async (messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return;

    const lastAssistantMessage = [...messages].reverse().find((m) => !m.isUser);
    if (!lastAssistantMessage?.text?.trim()) return;
    isLoadingTTS.value = true;
    isSpeaking.value = false;

    try {
      const response = await fetch('/api/synthesise-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lastAssistantMessage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Fetch failed: ${response.status} - ${errorData.message || 'Unknown error'}`
        );
      }
      const contentType = response.headers.get('Content-Type') || 'audio/wav';
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: contentType });

      const objectUrl = URL.createObjectURL(blob);
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      currentAudioUrl = objectUrl;

      audioStore.setAudioUrl(objectUrl);
    } catch (err) {
      console.error('TTS Error:', err);
      isSpeaking.value = false;
      isLoadingTTS.value = false;
    }
  };

  onUnmounted(() => {
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }
  });

  return {
    isSpeaking,
    isLoadingTTS,
    speakLastAssistantMessage,
    onSpeechEnd,
  };
}
