<template>
  <div class="w-full flex px-4" :class="block.isUser ? 'justify-end' : 'justify-center'">
    <div
      class="flex flex-col gap-3 p-3 rounded-lg select-none"
      :class="[
        block.isUser
          ? 'bg-green-100 text-gray-800 rounded-bl-none text-left max-w-[75%] w-auto items-center'
          : 'text-gray-800 text-left rounded-br-none hover:bg-yellow-50 max-w-[1000px] w-full box-border',
      ]"
    >
      <img
        v-if="block.isUser"
        src="https://i.pravatar.cc/40"
        alt="User Avatar"
        class="w-8 h-8 rounded-full flex-shrink-0"
      />

      <!-- Flatten all content into one ordered list -->
      <component
        v-for="(entry, idx) in unifiedBlocks"
        :key="idx"
        :is="entry.component"
        v-bind="entry.props"
        :startPlayback="globalPlaybackIndex === localPlaybackStart + idx"
        @finish="handleFinish(idx)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TextBubble from '@/components/playback/TextBubble.vue';
import SlideBubble from '@/components/playback/SlideBubble.vue';
import QuestionBubble from '@/components/playback/QuestionBubble.vue';

const props = defineProps<{
  block: any;
  index: number;
  globalPlaybackIndex: number;
  localPlaybackStart: number; // The start index of this block's flattened units in the global stream
}>();

const unifiedBlocks = computed(() => {
  const arr = [];

  if (props.block.type === 'text' && props.block.text) {
    arr.push({
      component: TextBubble,
      props: {
        text: props.block.text,
        isFirst: props.index === 0,
      },
    });
  }

  if (props.block.type === 'slides' && Array.isArray(props.block.slides)) {
    props.block.slides.forEach((slide) => {
      arr.push({
        component: SlideBubble,
        props: {
          slide,
          isUser: false,
          startPlayback: false,
        },
      });
    });
  }

  if (props.block.type === 'questions' && Array.isArray(props.block.questions)) {
    props.block.questions.forEach((question) => {
      arr.push({
        component: QuestionBubble,
        props: {
          text: question,
          isFirst: false,
        },
      });
    });
  }

  return arr;
});

const emit = defineEmits(['finish']);

// When a child finishes, emit the global finish event to parent with the global playback index
function handleFinish(localIdx: number) {
  const globalIdx = props.localPlaybackStart + localIdx;
  if (globalIdx === props.globalPlaybackIndex) {
    emit('finish');
  }
}
</script>
