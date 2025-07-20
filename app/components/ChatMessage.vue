<template>
  <div>
    <!-- Text Message -->
    <PlaybackBubble
      v-if="block.type === 'text'"
      :text="block.text"
      :is-user="block.isUser"
      :playable="block.playable"
      :is-first="index === 0"
    />

    <!-- Slides Carousel -->
    <Swiper
      v-else-if="block.type === 'slides'"
      :modules="modules"
      class="w-full max-w-3xl mx-auto"
      navigation
      :pagination="{ clickable: true }"
      :slides-per-view="1"
      :space-between="20"
    >
      <SwiperSlide v-for="(slide, idx) in block.slides" :key="slide.id || idx">
        <div class="p-20 bg-gray-100 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-2">
            {{ slide.part_label || slide.title }}
          </h2>
          <div v-html="cleanContent(slide.content)"></div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Questions List -->
    <PlaybackBubble
      v-else-if="block.type === 'questions'"
      v-for="(q, idx) in block.questions"
      :key="`question-${idx}`"
      :text="q"
      :is-user="false"
      :playable="true"
    />
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import PlaybackBubble from './PlaybackBubble.vue';

interface Slide {
  id?: string | number;
  part_label?: string;
  title?: string;
  content: string;
}

interface Block {
  type: 'text' | 'slides' | 'questions';
  text?: string;
  isUser?: boolean;
  playable?: boolean;
  slides?: Slide[];
  questions?: string[];
}

const props = defineProps<{ block: Block; index: number }>();
const modules = [Navigation, Pagination, Scrollbar, A11y];
function cleanContent(raw: string) {
  return raw.replace(/&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g, '[Image: $1]');
}
</script>
