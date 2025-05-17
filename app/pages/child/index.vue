<template>
  <div>
    <AppHeader />
    <div class="relative w-full h-screen md:mt-0 mt-[-60px]">
      <div class="relative w-full h-full" @mouseleave="resetOverlay">
        <img :src="background" class="w-full h-full object-cover" alt="challenge">

        <!-- Left overlay (desktop only) -->
        <div
          v-if="!isMobile"
          class="absolute top-0 left-0 w-1/2 h-full transition-colors duration-300 z-10"
          :class="leftOverlay ? 'bg-black/30' : 'bg-transparent'"
          @mousemove="handleMouseMoveLeft"
          @click="routeTo('/challenge')"
        >
          <ULink
            v-if="!leftOverlay"
            class="text-[#2f6089] drop-shadow-[1px_1px_1px_black] text-2xl md:text-3xl lg:text-4xl font-bold flex flex-col justify-start gap-2 px-6 py-3 mr-20"
          >
            Challenge
            <span class="text-sm mt-auto">Earn up to 10 credits</span>
          </ULink>
        </div>

        <!-- Right overlay (desktop only) -->
        <div
          v-if="!isMobile"
          class="absolute top-0 right-0 w-1/2 h-full transition-colors duration-300 z-10"
          :class="rightOverlay ? 'bg-black/30' : 'bg-transparent'"
          @mousemove="handleMouseMoveRight"
          @click="routeTo('/practice')"
        >
          <ULink
            v-if="!rightOverlay"
            class="text-[#c8e6ce] drop-shadow-[1px_1px_1px_black] text-2xl md:text-3xl lg:text-4xl font-bold flex flex-col justify-start gap-2 px-6 py-3 ml-auto"
          >
            Practice
            <span class="text-sm mt-auto">Try a sample challenge</span>
          </ULink>
        </div>

        <!-- Mobile overlays -->
        <div v-if="isMobile">
          <div
            class="absolute top-0 w-full h-1/2 flex flex-col justify-end text-center text-white text-2xl font-bold p-4 bg-black/10 z-10"
            @click="routeTo('/challenge')"
          >
            <span class="text-[#2f6089] drop-shadow-[1px_1px_1px_black]">Challenge</span>
            <span class="text-sm">Earn up to 10 credits</span>
          </div>
          <div
            class="absolute bottom-0 w-full h-1/2 flex flex-col justify-start text-center text-white text-2xl font-bold p-4 bg-black/10 z-10"
            @click="routeTo('/practice')"
          >
            <span class="text-[#c8e6ce] drop-shadow-[1px_1px_1px_black] mt-2">Practice</span>
            <span class="text-sm">Try a sample challenge</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import challenge from '../../../assets/challenge.png';
import challengeMobile from '../../../assets/challenge-mobile.png';
import { useProfileStore } from '~/stores/profile';

export default {
  setup() {
    // Get router instance using useRouter
    const router = useRouter();
    const profileStore = useProfileStore();
    // Reactive variable for the background image
    const background = ref(challenge);

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
        background.value = challengeMobile; // Set the mobile-specific image
        isMobile.value = true;
      } else {
        background.value = challenge; // Default image for larger screens
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
