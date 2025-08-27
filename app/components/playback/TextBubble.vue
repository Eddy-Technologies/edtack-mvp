<template>
  <div
    :class="[
      'flex items-start gap-2 transition-opacity duration-300',
      isUser ? 'flex-row-reverse ml-auto' : ''
    ]"
  >
    <div v-if="isUser" class="w-8 h-8 flex-shrink-0">
      <UserAvatar />
    </div>

    <!-- For user messages: direct text bubble -->
    <div
      v-if="isUser"
      :class="[
        'whitespace-pre-wrap transition-all duration-300 ease-out',
        'bg-green-100 p-2 rounded-xl max-w-[80%]'
      ]"
    >
      {{ text }}
    </div>

    <!-- For non-user messages: text + actions -->
    <div v-else class="flex flex-col">
      <div class="whitespace-pre-wrap transition-all duration-300 ease-out text-justify">
        {{ text }}
      </div>
      <MessageActions :message-text="text" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '../common/UserAvatar.vue';
import MessageActions from '../chat/MessageActions.vue';

const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
  isUser: boolean;
}>();

const emit = defineEmits(['finish']);
</script>
