<template>
  <div class="relative w-full min-h-screen bg-background overflow-auto text-center flex flex-col">
    <!-- Desktop Background Image -->
    <img
      v-if="!isMobile"
      :src="background"
      class="fixed top-0 left-0 w-full h-full object-cover z-0 transition-all duration-500 ease-in-out"
      alt="home"
    >

    <!-- Mobile Background Layer -->
    <div v-if="isMobile" class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-background z-0" />
      <img :src="mobileLeft" class="absolute top-[180px] sm:top-[100px] left-0 w-[180px] sm:w-[200px] h-auto z-10 transition-all duration-500 ease-in-out">
      <img :src="mobileRight" class="absolute bottom-0 right-0 w-[180px] sm:w-[200px] h-auto z-10 transition-all duration-500 ease-in-out">
    </div>

    <!-- Overlay content -->
    <div class="relative md:mt-0 mt-10 z-10 pt-10 sm:pt-16 md:pt-16 flex flex-col items-center px-4 sm:px-6">
      <!-- Landing Message -->
      <div class="px-4 sm:px-8 mb-4 max-w-full font-serif mt-2 text-center">
        <div class="flex items-center justify-center flex-wrap">
          <h1 class="text-2xl md:text-3xl text-black mr-3">Welcome to Eddy</h1>
          <img src="/logo.png" class="w-[50px] sm:w-[60px] h-auto">
        </div>
        <h2 class="text-lg sm:text-xl md:text-2xl text-black mt-2 leading-snug">
          An educational platform where parents can incentivise and motivate <br class="hidden sm:block">
          their children for consistent and fun learning.
        </h2>
      </div>

      <div class="flex flex-col mb-4 md:mb-0 items-center justify-center gap-4 w-full">
        <!-- Top button centered -->
        <button
            class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
            @click="routeTo('/register')"
        >
          Try Eddy Now
        </button>
      </div>

      <!-- Info Boxes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:mt-6 gap-5 w-full max-w-[280px] sm:max-w-[600px] mb-5">
        <div
          v-for="(box, i) in infoBoxes"
          :key="i"
          class="relative bg-white/70 p-4 sm:p-5 rounded-lg text-black text-center h-[240px] sm:h-[250px] flex flex-col justify-center items-center shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out"
          @mouseenter="hoveredBoxIndex = i"
          @mouseleave="hoveredBoxIndex = null"
        >
          <!--
          <div v-if="hoveredBoxIndex === i" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <img :src="box.image" class="w-[300px] sm:w-[500px] max-w-[80vw] h-auto object-contain shadow-lg rounded transition-transform duration-300 scale-110" />
          </div>
          -->
          <div>
            <UIcon :name="box.icon" class="text-[2rem] sm:text-[2.5rem] text-blue-700" />
          </div>
          <p class="text-xs sm:text-sm md:text-base font-bold mt-2">{{ box.label }}</p>
          <p class="text-base sm:text-xl md:text-2xl mt-2 leading-snug">{{ box.description }}</p>
        </div>
      </div>

      <!-- Call-to-Actions -->
      <div class="flex flex-col items-center justify-center gap-4 mb-16 w-full">
        <!-- Responsive button layout -->
        <div class="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto items-center">
          <button
              class="w-[220px] py-2 rounded-lg font-bold cursor-pointer bg-black text-white hover:bg-gray-800 text-base sm:text-lg md:text-xl transition-colors duration-300"
              @click="routeTo('/demo')"
          >
            Request Demo
          </button>
          <button
              class="w-[220px] py-2 rounded-lg font-bold cursor-pointer bg-black text-white hover:bg-gray-800 text-base sm:text-lg md:text-xl transition-colors duration-300"
              @click="routeTo('/about')"
          >
            About Us
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import home from '../../../assets/home.png';
import homeMobile from '../../../assets/home-mobile.png';
import parent from '../../../assets/parent.png';
import child from '../../../assets/child.png';
import deposit from '../../../assets/deposit.png';
import { useRouter } from '#vue-router';

const router = useRouter();
const background = ref(home);
const mobileLeft = ref(parent);
const mobileRight = ref(child);
const isMobile = ref(false);
const hoveredBoxIndex = ref(null);

const desktopInfoBox = [
  {
    image: deposit,
    icon: 'i-heroicons-user-group',
    label: 'Parent Dashboard',
    description: 'Top up cash and control settings'
  },
  {
    image: deposit,
    icon: 'i-heroicons-light-bulb',
    label: 'Earn Rewards',
    description: 'Earn credits from weekly challenges'
  },
  {
    image: deposit,
    icon: 'i-heroicons-chart-bar',
    label: 'Track Progress',
    description: `Track your child's progress with easy to visualise charts`
  },
  {
    image: deposit,
    icon: 'i-heroicons-building-storefront',
    label: 'The Store',
    description: 'Swap your credits for exciting goodies'
  }
];

const mobileInfoBoxes = [
  {
    image: deposit,
    icon: 'i-heroicons-user-group',
    label: 'Parent Dashboard',
    description: 'Top up cash and control settings'
  },
  {
    image: deposit,
    icon: 'i-heroicons-chart-bar',
    label: 'Track Progress',
    description: `Track your child's progress with easy to visualise charts`
  },
  {
    image: deposit,
    icon: 'i-heroicons-light-bulb',
    label: 'Earn Rewards',
    description: 'Earn credits from weekly challenges'
  },
  {
    image: deposit,
    icon: 'i-heroicons-building-storefront',
    label: 'The Store',
    description: 'Swap your credits for exciting goodies'
  }
];

const infoBoxes = computed(() => (isMobile.value ? mobileInfoBoxes : desktopInfoBox));

const checkMobile = () => window.innerWidth <= 768;
const routeTo = (route) => router.push(route);
const updateBackground = () => {
  isMobile.value = checkMobile();
  background.value = isMobile.value ? homeMobile : home;
};

onMounted(() => {
  updateBackground();
  window.addEventListener('resize', updateBackground);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBackground);
});
</script>

<style scoped></style>
