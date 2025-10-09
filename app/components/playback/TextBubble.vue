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
      <MDCRenderer
        v-if="mdcBody"
        :body="mdcBody"
        tag="div"
        class="prose prose-md max-w-none"
      />
      <div v-else>{{ text }}</div>
    </div>

    <!-- For non-user messages: text + actions -->
    <div v-else class="flex flex-col">
      <div class="p-3 rounded-lg bg-white">
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

const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
  isUser: boolean;
  messageId?: string;
}>();

defineEmits(['finish']);

const mdcBody = ref();

// Parse markdown reactively
watchEffect(async () => {
  if (props.text) {
    const parsedContent = await parseMarkdown(props.text);
    mdcBody.value = parsedContent?.body;
  }
});
</script>
