<template>
  <div class="relative w-full min-h-screen bg-white overflow-auto">
    <!-- Netflix-style Header -->
    <div class="relative z-10 p-4 sm:p-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="/logo.png" class="w-[40px] sm:w-[50px] h-auto mr-3">
          <h1 class="text-gray-800 text-xl sm:text-2xl font-bold">Eddy</h1>
        </div>
        <div class="flex gap-4">
          <Button
            variant="primary"
            text="Login"
            @click="$router.push('/chat')"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 px-4 sm:px-8 pb-8">
      <!-- Character Carousel -->
      <div class="mb-8">
        <h3 class="text-gray-800 text-xl sm:text-2xl font-semibold mb-6 text-center">
          Choose Your Character
        </h3>
        <CharacterCarousel v-model="selectedAvatar" />
      </div>

      <!-- Character Grid -->
      <div class="mb-8">
        <h3 class="text-gray-800 text-xl sm:text-2xl font-semibold mb-6 text-center">
          Browse All Characters
        </h3>
        <div class="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div
            v-for="(avatar, index) in allAvatars"
            :key="index"
            class="group cursor-pointer w-32 sm:w-36"
            @click="selectAvatar(avatar, index)"
          >
            <div class="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 sm:p-6 text-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group-hover:scale-105 shadow-sm hover:shadow-md">
              <div class="relative mb-4">
                <img
                  :src="avatar.image"
                  :alt="avatar.name"
                  class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full object-cover border-2 border-gray-300 group-hover:border-gray-400 transition-all duration-300"
                >
              </div>
              <h5 class="text-gray-800 text-sm sm:text-base font-semibold mb-1">{{ avatar.name }}</h5>
              <p class="text-gray-600 text-xs sm:text-sm">{{ avatar.type }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Get Started Button -->
      <div class="text-center mt-8 sm:mt-12">
        <Button
          variant="primary"
          text="Get Started"
          @click="$router.push('/chat')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import boyAvatar from '../../../assets/boy.png';
import girlAvatar from '../../../assets/girl.png';
import defaultAvatar from '../../../assets/default-avatar.png';
import Button from '~/components/common/Button.vue';
import CharacterCarousel from '~/components/CharacterCarousel.vue';
import { useRouter } from '#vue-router';

const router = useRouter();
const selectedAvatar = ref(null);

const allAvatars = ref([
  {
    id: 1,
    name: 'Alex',
    image: boyAvatar,
    type: 'Explorer'
  },
  {
    id: 2,
    name: 'Luna',
    image: girlAvatar,
    type: 'Scholar'
  },
  {
    id: 3,
    name: 'Sam',
    image: defaultAvatar,
    type: 'Scientist'
  },
  {
    id: 4,
    name: 'Snorlax',
    image: '/snorlax.png',
    type: 'Sleepy'
  },
  {
    id: 5,
    name: 'Mystery',
    image: boyAvatar,
    type: 'Unknown'
  },
  {
    id: 6,
    name: 'Future',
    image: girlAvatar,
    type: 'Coming Soon'
  },
  {
    id: 7,
    name: 'Classic',
    image: defaultAvatar,
    type: 'Traditional'
  },
  {
    id: 8,
    name: 'Special',
    image: '/snorlax.png',
    type: 'Unique'
  }
]);

const selectAvatar = (avatar, index) => {
  selectedAvatar.value = avatar;
  console.log('Selected avatar:', avatar);
};
</script>

<style scoped></style>
