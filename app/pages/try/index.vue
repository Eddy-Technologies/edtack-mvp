<template>
  <div class="relative w-full h-screen">
    <div class="relative w-full h-full" @mouseleave="resetOverlay">
      <img :src="background" class="w-full h-full object-cover" alt="home">

      <!-- Desktop Overlays -->
      <div
        v-if="!isMobile"
        :class="[
          'absolute top-0 left-0 h-full w-1/2 transition-colors duration-300 z-10',
          leftOverlay ? 'bg-black/30' : 'bg-transparent'
        ]"
        @mousemove="handleMouseMoveLeft"
        @click="routeTo('/parent')"
      >
        <ULink
          v-if="!leftOverlay"
          class="text-[#2f6089] drop-shadow-lg text-2xl md:text-3xl lg:text-4xl font-bold flex gap-x-2 px-6 py-3 mr-20"
        >
          Are you a parent?
        </ULink>
      </div>

      <div
        v-if="!isMobile"
        :class="[
          'absolute top-0 right-0 h-full w-1/2 transition-colors duration-300 z-10',
          rightOverlay ? 'bg-black/30' : 'bg-transparent'
        ]"
        @mousemove="handleMouseMoveRight"
        @click="routeTo('/onboard')"
      >
        <ULink
          v-if="!rightOverlay"
          class="text-[#c8e6ce] drop-shadow-lg text-2xl md:text-3xl lg:text-4xl font-bold flex gap-x-2 px-6 py-3 ml-auto"
        >
          Are you a student?
        </ULink>
      </div>

      <!-- Mobile Overlays -->
      <div v-if="isMobile">
        <div
          class="absolute top-0 w-full h-1/2 bg-black/10 text-center text-white text-2xl font-bold flex items-center justify-center z-10"
          @click="routeTo('/parent')"
        >
          <span class="drop-shadow-xl text-[#2f6089]">Are you a parent?</span>
        </div>
        <div
          class="absolute bottom-0 w-full h-1/2 bg-black/10 text-center text-white text-2xl font-bold flex items-center justify-center z-10"
          @click="routeTo('/onboard')"
        >
          <span class="drop-shadow-dramatic text-3xl text-[#c8e6ce] font-bold">Are you a student?</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import home from '../../../assets/home2.png';
import homeMobile from '../../../assets/home-mobile-2.png';
import { useProfileStore } from '~/stores/profile';

export default {
  setup() {
    // Get router instance using useRouter
    const router = useRouter();
    const profileStore = useProfileStore();
    // Reactive variable for the background image
    const background = ref(home);

    // Reactive state to control the overlays
    const leftOverlay = ref(false);
    const rightOverlay = ref(false);

    const routeTo = (route) => {
      profileStore.setProfile(route);
      router.push(route); // Use router.push instead of this.$router.push
    };

    // Reactive state for mobile check
    const isMobile = ref(false);

    // Function to check if the device is mobile
    const checkMobile = () => {
      return window.innerWidth <= 768; // Adjust this threshold based on your needs
    };

    // Update the background image based on device type
    const updateBackground = () => {
      if (checkMobile()) {
        background.value = homeMobile; // Set the mobile-specific image
        isMobile.value = true;
      } else {
        background.value = home; // Default image for larger screens
        isMobile.value = false;
      }
    };

    // Handle mouse movement over the image
    const handleMouseMoveLeft = () => {
      leftOverlay.value = false; // Keep the left overlay transparent
      rightOverlay.value = true; // Darken the right overlay
    };

    const handleMouseMoveRight = () => {
      leftOverlay.value = true; // Darken the left overlay
      rightOverlay.value = false; // Keep the right overlay transparent
    };

    // Reset overlays when mouse leaves the image
    const resetOverlay = () => {
      leftOverlay.value = false;
      rightOverlay.value = false;
    };

    // Watch for window resize to update the image dynamically
    onMounted(() => {
      updateBackground(); // Initial check when the component is mounted
      window.addEventListener('resize', updateBackground); // Update on resize
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateBackground); // Clean up the event listener
    });

    return {
      background,
      leftOverlay,
      rightOverlay,
      isMobile,
      routeTo,
      handleMouseMoveLeft,
      handleMouseMoveRight,
      resetOverlay,
    };
  },
};
</script>
