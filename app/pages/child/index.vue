<template>
  <AppHeader />
  <div class="app">
    <div class="image-container" @mouseleave="resetOverlay">
      <img :src="background" class="item-image" alt="challenge">

      <!-- Left overlay: covers left half of the image (hidden on mobile) -->
      <div
          v-if="!isMobile"
          @mousemove="handleMouseMoveLeft"
          class="overlay left-overlay"
          @click="routeTo('/challenge')"
          :style="{ backgroundColor: leftOverlay ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)'}">
        <ULink
            v-if="!leftOverlay"
            class="challenge-text drop-shadow-[1px_1px_1px_black] text-2xl md:text-3xl lg:text-4xl font-bold flex gap-x-2 px-6 py-3 mr-20"
            style="display: flex; flex-direction: column; justify-content: flex-start;"
        >
          Challenge
          <span class="credits-amount text-sm" style="margin-top: auto;">Earn up to 10 credits</span>
        </ULink>
      </div>

      <!-- Right overlay: covers right half of the image (hidden on mobile) -->
      <div
          v-if="!isMobile"
          @mousemove="handleMouseMoveRight"
          class="overlay right-overlay"
          @click="routeTo('/practice')"
          :style="{ backgroundColor: rightOverlay ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)'}">
        <ULink
            v-if="!rightOverlay"
            class="practice-text drop-shadow-[1px_1px_1px_black] text-2xl md:text-3xl lg:text-4xl font-bold flex gap-x-2 px-6 py-3 ml-auto"
            style="display: flex; flex-direction: column; justify-content: flex-start;"
        >
          Practice
          <span class="credits-amount text-sm" style="margin-top: auto;">Try a sample challenge</span>
        </ULink>
      </div>

      <!-- For Mobile devices: Top and Bottom half overlays -->
      <div v-if="isMobile">
        <!-- Top half overlay (clickable) -->
        <div
            class="mobile-overlay top-overlay"
            @click="routeTo('/challenge')"
            style="display: flex; flex-direction: column; justify-content: flex-end;"
        >
          <span class="challenge-text drop-shadow-[1px_1px_1px_black]">Challenge</span>
          <span class="challenge-text text-sm">Earn up to 10 credits</span>
        </div>

        <!-- Bottom half overlay (clickable) -->
        <div
            class="mobile-overlay bottom-overlay"
            @click="routeTo('/practice')"
            style="display: flex; flex-direction: column; justify-content: flex-start;"
        >
          <span class="practice-text drop-shadow-[1px_1px_1px_black] mt-2">Practice</span>
          <span class="practice-text text-sm">Try a sample challenge</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import challenge from "../../../assets/challenge.png";
import challengeMobile from "../../../assets/challenge-mobile.png";
import { useProfileStore } from "~/stores/profile";

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

<style lang="scss" scoped>
.challenge-text {
  color: #2f6089
}
.practice-text {
  color: #c8e6ce
}
.app {
  position: relative;
  width: 100%;
  height: 100vh; /* Ensure the app takes full screen height */

  @media (max-width: 768px) { // Adjust layout for mobile screens
    margin-top: -60px;
  }
}
.image-container {
  position: relative;
  width: 100%;
  height: 100%; /* Ensure the image container takes up full height of the app */
}

/* Ensure the image takes up the full width and height */
.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image fully covers the container */
}

/* Overlay styles */
.overlay {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  transition: background-color 0.3s ease-in-out;
  z-index: 5; /* Overlay stays above the image */
}

.left-overlay {
  left: 0; /* Covers the left half of the image */
}

.right-overlay {
  right: 0; /* Covers the right half of the image */
}

/* Mobile Styles: Links positioned at the top and bottom */
.mobile-overlay {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1); /* Semi-transparent overlay */
  color: white;
}

.top-overlay {
  top: 0;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-overlay {
  bottom: 0;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
