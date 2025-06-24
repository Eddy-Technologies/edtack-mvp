import { ref, onUnmounted } from 'vue';

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export function useSpeech() {
  const isSpeaking = ref(false);
  const isLoadingTTS = ref(false);
  const audioPlayer = ref<HTMLAudioElement | null>(null);
  let currentAudioUrl: string | null = null;

  let speechEndCallback: (() => void) | null = null;

  function onSpeechEnd(cb: () => void) {
    speechEndCallback = cb;
  }

  const speakLastAssistantMessage = async (messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return;

    const lastAssistantMessage = [...messages].reverse().find((m) => !m.isUser);
    if (!lastAssistantMessage?.text?.trim()) return;

    if (!audioPlayer.value) {
      audioPlayer.value = new Audio();
    }

    if (audioPlayer.value.src === currentAudioUrl) {
      if (!audioPlayer.value.paused) {
        audioPlayer.value.pause();
        isSpeaking.value = false;
      } else {
        try {
          await audioPlayer.value.play();
          isSpeaking.value = true;
        } catch (e) {
          console.error('Audio play failed:', e);
          isSpeaking.value = false;
        }
      }
      return;
    }

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

      audioPlayer.value.src = objectUrl;
      audioPlayer.value.load();

      audioPlayer.value.onplaying = () => {
        isSpeaking.value = true;
        isLoadingTTS.value = false;
      };
      audioPlayer.value.onended = () => {
        isSpeaking.value = false;
        if (speechEndCallback) {
          speechEndCallback();
          speechEndCallback = null;
        }
      };
      audioPlayer.value.onerror = (e) => {
        const err = audioPlayer.value?.error;
        if (err) {
          console.error('MediaError code:', err.code);
          switch (err.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              console.error('MEDIA_ERR_ABORTED');
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              console.error('MEDIA_ERR_NETWORK');
              break;
            case MediaError.MEDIA_ERR_DECODE:
              console.error('MEDIA_ERR_DECODE');
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              console.error('MEDIA_ERR_SRC_NOT_SUPPORTED');
              break;
            default:
              console.error('Unknown media error');
          }
        }
        console.error('Audio playback error event:', e);
        // existing cleanup
      };

      audioPlayer.value.oncanplaythrough = async () => {
        try {
          await audioPlayer.value?.play();
        } catch (e) {
          console.error('Autoplay blocked or failed:', e);
        }
      };

      await audioPlayer.value.play();
    } catch (err) {
      console.error('TTS Error:', err);
      isSpeaking.value = false;
      isLoadingTTS.value = false;
    }
  };

  const stopSpeaking = () => {
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.currentTime = 0;
      isSpeaking.value = false;
      isLoadingTTS.value = false;
      audioPlayer.value.src = '';
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }
    speechEndCallback = null;
  };

  const toggleAudioPlayer = async () => {
    if (!audioPlayer.value) return;

    if (audioPlayer.value.paused) {
      try {
        await audioPlayer.value.play();
        isSpeaking.value = true;
      } catch (e) {
        console.error('Error resuming audio:', e);
        isSpeaking.value = false;
      }
    } else {
      audioPlayer.value.pause();
      isSpeaking.value = false;
    }
  };

  onUnmounted(() => {
    stopSpeaking();
    if (audioPlayer.value) {
      audioPlayer.value.src = '';
      audioPlayer.value = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }
  });

  return {
    isSpeaking,
    isLoadingTTS,
    speakLastAssistantMessage,
    stopSpeaking,
    toggleAudioPlayer,
    onSpeechEnd,
  };
}
