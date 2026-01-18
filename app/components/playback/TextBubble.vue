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

    <!-- For user messages: direct text bubble with status -->
    <div v-if="isUser" class="flex flex-col items-end max-w-[80%]">
      <div
        :class="[
          'whitespace-pre-wrap transition-all duration-200 ease-out',
          'bg-stone-100 p-3 rounded-xl'
        ]"
      >
        <!-- File attachments (shown above text) -->
        <MessageFileAttachments
          v-if="fileAttachments && fileAttachments.length > 0"
          :attachments="fileAttachments"
          :thread-id="threadId"
          class="mb-2"
        />
        <MDCRenderer
          v-if="mdcBody"
          :body="mdcBody"
          tag="div"
          class="prose prose-md max-w-none"
        />
        <div v-else>{{ text }}</div>
      </div>
      <!-- Message status indicator -->
      <div v-if="status && status !== 'sent'" class="flex items-center gap-1 mt-1 text-xs">
        <template v-if="status === 'queued'">
          <Icon name="i-heroicons-clock" class="w-3 h-3 text-gray-400" />
          <span class="text-gray-400">Waiting to send...</span>
        </template>
        <template v-else-if="status === 'sending'">
          <Icon name="i-heroicons-arrow-path" class="w-3 h-3 text-blue-500 animate-spin" />
          <span class="text-blue-500">Sending...</span>
        </template>
        <template v-else-if="status === 'failed'">
          <Icon name="i-heroicons-exclamation-triangle" class="w-3 h-3 text-red-500" />
          <span class="text-red-500">Unable to complete</span>
          <button
            v-if="showRetry"
            class="ml-2 text-primary-600 hover:text-primary-700 hover:underline font-medium"
            @click="$emit('retry', { messageId, text })"
          >
            Retry
          </button>
        </template>
        <template v-else-if="status === 'cancelled'">
          <Icon name="i-heroicons-x-circle" class="w-3 h-3 text-gray-400" />
          <span class="text-gray-400">Cancelled</span>
          <button
            v-if="showRetry"
            class="ml-2 text-primary-600 hover:text-primary-700 hover:underline font-medium"
            @click="$emit('retry', { messageId, text })"
          >
            Retry
          </button>
        </template>
        <template v-else-if="status === 'retried'">
          <Icon name="i-heroicons-arrow-path" class="w-3 h-3 text-gray-400" />
          <span class="text-gray-400">Retried below</span>
        </template>
      </div>
    </div>

    <!-- For non-user messages: text + actions -->
    <div v-else class="flex flex-col">
      <div class="p-3 rounded-xl">
        <MDCRenderer
          v-if="mdcBody"
          :body="mdcBody"
          tag="div"
          class="prose prose-md max-w-none"
        />
        <div v-else>{{ text }}</div>
      </div>
      <MessageActions
        :message-text="text"
        :message-id="messageId"
      />
    </div>
  </div>
</template>
<!-- For tailwind prose styling, refer to tailwind.config typography -->

<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime';
import UserAvatar from '../common/UserAvatar.vue';
import MessageActions from '../chat/MessageActions.vue';
import MessageFileAttachments from '../chat/MessageFileAttachments.vue';
import type { MessageAttachment } from '~/types/fileUpload';

const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
  isUser: boolean;
  messageId?: string;
  status?: 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'retried';
  showRetry?: boolean; // Only show retry for most recent failed/cancelled message
  fileAttachments?: MessageAttachment[]; // File attachments for user messages
  threadId?: string; // Thread ID for file URLs
}>();

defineEmits(['finish', 'retry']);

const mdcBody = ref();

// Parse markdown reactively
watchEffect(async () => {
  if (props.text) {
    const parsedContent = await parseMarkdown(props.text);
    mdcBody.value = parsedContent?.body;
  }
});
</script>
