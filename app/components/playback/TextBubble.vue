<template>
  <div
    :class="[
      'flex items-start gap-2 transition-opacity duration-300',
      isUser ? 'flex-row-reverse ml-auto' : ''
    ]"
  >
    <div v-if="isUser" class="w-8 h-8 flex-shrink-0">
      <img
        src="https://avatar.iran.liara.run/public"
        alt="User"
        class="w-full h-full rounded-full object-cover"
      >
    </div>
    <div
      :class="[
        'whitespace-pre-wrap transition-all duration-300 ease-out',
        isUser ? 'bg-green-100 p-2 rounded-xl max-w-[80%]' : 'max-w-[80%]'
      ]"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
  isUser: boolean;
}>();

const emit = defineEmits(['finish']);
</script>
