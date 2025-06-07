<template>
  <div class="chat-demo-container bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-primary-500 text-white px-6 py-4">
      <h3 class="text-lg font-semibold">Try Eddy Chat Demo</h3>
      <p class="text-primary-100 text-sm">Ask me anything about your studies!</p>
    </div>

    <!-- Chat Messages -->
    <div ref="messagesContainer" class="h-96 overflow-y-auto p-4 bg-gray-50">
      <div class="space-y-4">
        <!-- Welcome message -->
        <div v-if="messages.length === 0" class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <img src="/logo.png" alt="Eddy" class="w-8 h-8 rounded-full">
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm max-w-xs">
            <p class="text-sm text-gray-800">
              Hi! I'm Eddy, your AI learning companion. Ask me anything about math, science, or any subject you're studying!
            </p>
          </div>
        </div>

        <!-- Chat messages -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex"
          :class="message.isUser ? 'justify-end' : 'items-start space-x-3'"
        >
          <!-- Assistant avatar -->
          <div v-if="!message.isUser" class="flex-shrink-0">
            <img src="/logo.png" alt="Eddy" class="w-8 h-8 rounded-full">
          </div>

          <!-- Message bubble -->
          <div
            class="rounded-lg p-3 shadow-sm max-w-xs"
            :class="message.isUser
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-800'"
          >
            <p class="text-sm">{{ message.text }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <img src="/logo.png" alt="Eddy" class="w-8 h-8 rounded-full">
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="border-t p-4 bg-white">
      <div class="flex items-center gap-2">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Ask me about your studies..."
          class="flex-1 p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="isTyping"
          @keydown.enter="sendMessage"
        >
        <button
          class="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isTyping || !inputMessage.trim()"
          @click="sendMessage"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      <!-- Quick suggestions -->
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="suggestion in quickSuggestions"
          :key="suggestion"
          class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
          :disabled="isTyping"
          @click="sendSuggestion(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement>();

const quickSuggestions = [
  'Help me with math',
  'Explain photosynthesis',
  'Quiz me on history',
  'Check my homework',
];

// Demo responses for different types of questions
const demoResponses = {
  math: [
    'I\'d love to help you with math! What specific topic are you working on? Algebra, geometry, calculus, or something else?',
    'Math can be tricky, but we\'ll figure it out together! What problem are you stuck on?',
    'Great! Math is one of my favorite subjects. Tell me what you\'re learning about.',
  ],
  science: [
    'Science is fascinating! Are you studying biology, chemistry, physics, or earth science?',
    'I love helping with science questions! What experiment or concept are you exploring?',
    'Science opens up so many mysteries of our world. What would you like to learn about?',
  ],
  history: [
    'History helps us understand our past and present! What period or event interests you?',
    'There are so many amazing stories in history. What would you like to explore?',
    'I enjoy discussing historical events and their impact. What\'s your question?',
  ],
  general: [
    'That\'s a great question! I\'m here to help you learn and understand any subject.',
    'I love helping students succeed! Can you tell me more about what you\'re studying?',
    'Learning is an adventure! What subject or topic would you like to explore together?',
    'Every question is a step toward knowledge. How can I assist you today?',
  ],
};

const getRandomResponse = (category: keyof typeof demoResponses) => {
  const responses = demoResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getDemoResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('math') || lowerMessage.includes('algebra') || lowerMessage.includes('geometry') || lowerMessage.includes('calculus')) {
    return getRandomResponse('math');
  }

  if (lowerMessage.includes('science') || lowerMessage.includes('biology') || lowerMessage.includes('chemistry') || lowerMessage.includes('physics') || lowerMessage.includes('photosynthesis')) {
    return getRandomResponse('science');
  }

  if (lowerMessage.includes('history') || lowerMessage.includes('historical') || lowerMessage.includes('war') || lowerMessage.includes('ancient')) {
    return getRandomResponse('history');
  }

  return getRandomResponse('general');
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return;

  const userMessage = inputMessage.value.trim();

  // Add user message
  messages.value.push({
    text: userMessage,
    isUser: true,
    timestamp: new Date(),
  });

  inputMessage.value = '';
  await scrollToBottom();

  // Show typing indicator
  isTyping.value = true;
  await scrollToBottom();

  // Simulate AI response delay
  setTimeout(async () => {
    const response = getDemoResponse(userMessage);

    messages.value.push({
      text: response,
      isUser: false,
      timestamp: new Date(),
    });

    isTyping.value = false;
    await scrollToBottom();
  }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
};

const sendSuggestion = (suggestion: string) => {
  inputMessage.value = suggestion;
  sendMessage();
};
</script>

<style scoped>
.chat-demo-container {
  @apply max-w-2xl mx-auto;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>
