<template>
  <AppHeader />
  <div class="app">
    <div class="image-container" @mouseleave="resetOverlay">
      <img :src="background" class="item-image" alt="home">

      <!-- Left overlay: covers left half of the image (hidden on mobile) -->
      <div
          v-if="!isMobile"
          @mousemove="handleMouseMoveLeft"
          class="overlay left-overlay"
          @click="routeTo('/parent')"
          :style="{ backgroundColor: leftOverlay ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)'}">
        <ULink
            v-if="!leftOverlay"
            class="parent-text drop-shadow-[1px_1px_1px_black] text-2xl md:text-3xl lg:text-4xl font-bold flex gap-x-2 px-6 py-3 mr-20"
        >
          Are you a parent?
        </ULink>
      </div>

      <!-- Right overlay: covers right half of the image (hidden on mobile) -->
      <div
          v-if="!isMobile"
          @mousemove="handleMouseMoveRight"
          class="overlay right-overlay"
          @click="routeTo('/child')"
          :style="{ backgroundColor: rightOverlay ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)'}">
        <ULink
            v-if="!rightOverlay"
            class="student-text drop-shadow-[1px_1px_1px_black] text-2xl md:text-3xl lg:text-4xl font-bold flex gap-x-2 px-6 py-3 ml-auto"
        >
          Are you a student?
        </ULink>
      </div>

      <!-- For Mobile devices: Top and Bottom half overlays -->
      <div v-if="isMobile">
        <!-- Top half overlay (clickable) -->
        <div
            class="mobile-overlay top-overlay"
            @click="routeTo('/parent')"
        >
          <span class="parent-text drop-shadow-[1px_1px_1px_black]">Are you a parent?</span>
        </div>

        <!-- Bottom half overlay (clickable) -->
        <div
            class="mobile-overlay bottom-overlay"
            @click="routeTo('/child')"
        >
          <span class="student-text drop-shadow-[1px_1px_1px_black]">Are you a student?</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import home from "../../../assets/home.png";
import homeMobile from "../../../assets/home-mobile.png";
import { useProfileStore } from "~/stores/profile";

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

<style lang="scss" scoped>
.parent-text {
  color: #2f6089
}
.student-text {
  color: #c8e6ce
}
.app {
  position: relative;
  width: 100%;
  height: 100vh; /* Ensure the app takes full screen height */
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
