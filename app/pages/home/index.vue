<template>
  <div class="landing-page">
    <!-- Desktop Background Image -->
    <img v-if="!isMobile" :src="background" class="background-image" alt="home" />

    <!-- Mobile Background Layer -->
    <div v-if="isMobile" class="mobile-decor">
      <img :src="mobileLeft" class="mobile-left-img" />
      <div class="mobile-background-fill"></div>
      <img :src="mobileRight" class="mobile-right-img" />
    </div>

    <!-- Overlay content -->
    <div class="overlay">
      <!-- Landing Message -->
      <div class="landing-message">
        <div class="header-row">
          <h1 class="text-2xl md:text-3xl text-black header mr-3">
            Welcome to Eddy
          </h1>
          <img src="/logo.png" class="logo" />
        </div>
        <h2 class="text-xl md:text-2xl text-black header mt-2">
          An educational platform where parents can incentivise and motivate <br />
          their children for consistent and fun learning.
        </h2>
      </div>

      <!-- Info Boxes -->
      <div class="info-grid">
        <div
            class="info-box"
            v-for="(box, i) in infoBoxes"
            :key="i"
            @mouseenter="hoveredBoxIndex = i"
            @mouseleave="hoveredBoxIndex = null"
        >
          <div v-if="hoveredBoxIndex === i" class="hover-image-wrapper">
            <img :src="box.image" class="hover-image" />
          </div>
          <div v-else>
            <UIcon :name="box.icon" class="info-icon" />
          </div>
          <p class="text-sm md:text-base font-bold mt-2">{{ box.label }}</p>
          <p class="text-xl md:text-2xl mt-2">{{ box.description }}</p>
        </div>
      </div>

      <!-- Call-to-Actions -->
      <div class="cta-buttons">
        <button class="landing-btn text-l md:text-xl font-bold" @click="routeTo('/try')">Try Eddy Now</button>
        <button class="demo-btn text-l md:text-xl font-bold" @click="routeTo('/landing')">Request Demo</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import home from "../../../assets/home.png";
import homeMobile from "../../../assets/home-mobile.png";
import parent from "../../../assets/parent.png";
import child from "../../../assets/child.png";
import deposit from "../../../assets/deposit.png";
import {useRouter} from "#vue-router";

export default {
  setup() {
    const router = useRouter();
    const background = ref(home);
    const mobileLeft = ref(parent);
    const mobileRight = ref(child);
    const isMobile = ref(false);
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
        description: `Track your child\'s progress with easy to visualise charts`
      },
      {
        image: deposit,
        icon: 'i-heroicons-building-storefront',
        label: 'The Store',
        description: 'Swap your credits for exciting goodies'
      },
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
        description: `Track your child\'s progress with easy to visualise charts`
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
      },
    ];
    const infoBoxes = computed(() => isMobile.value ? mobileInfoBoxes : desktopInfoBox);

    const hoveredBoxIndex = ref(null);

    const checkMobile = () => window.innerWidth <= 768;
    const routeTo = (route) => {
      router.push(route); // Use router.push instead of this.$router.push
    };
    const updateBackground = () => {
      isMobile.value = checkMobile();
      background.value = isMobile.value ? homeMobile : home;
    };

    const goToApp = () => {
      console.log("Navigating to app");
    };

    const requestDemo = () => {
      console.log("Requesting a demo");
    };

    onMounted(() => {
      updateBackground();
      window.addEventListener("resize", updateBackground);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateBackground);
    });

    return {
      background,
      mobileLeft,
      mobileRight,
      isMobile,
      routeTo,
      infoBoxes,
      hoveredBoxIndex
    };
  },
};
</script>

<style scoped>
.landing-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: auto;
  text-align: center;
}
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.logo {
  width: 60px; /* Adjust size as needed */
  height: auto;
}

.overlay {
  position: relative;
  z-index: 1;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

@media (max-width: 768px) {
  .mobile-decor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;
  }

  .mobile-left-img {
    position: fixed;
    top: 130px;
    left: 0;
    width: 200px;
    height: auto;
  }

  .mobile-right-img {
    position: fixed;
    bottom: 0px;
    right: 0;
    width: 200px;
    height: auto;
    z-index: 1;
  }

  .mobile-background-fill {
    position: fixed;
    top: 0px;
    bottom: 0px;
    left: 0;
    right: 0;
    background-color: #c8e6ce;
    z-index: -1;
  }
}

.landing-message {
  padding: 20px 30px;
  margin-bottom: 10px;
  max-width: 100%;
  font-family: Georgia, sans-serif;
}

@media (max-width: 768px) {
  .landing-message {
    margin-top: 10px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 250px;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
  }
}

.info-box {
  position: relative;
  background: rgba(255, 255, 255, 0.70);
  padding: 20px;
  border-radius: 10px;
  color: black;
  text-align: center;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.info-icon {
  font-size: 2.5rem;
  color: #2b6cb0;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 60px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

@media (min-width: 768px) {
  .cta-buttons {
    flex-direction: row;
  }
}

.landing-btn,
.demo-btn {
  width: 200px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
  text-align: center;
}

.landing-btn {
  background-color: white;
  color: black;
}

.demo-btn {
  background-color: #222;
  color: white;
}

.landing-btn:hover {
  background-color: #e2e2e2;
}

.demo-btn:hover {
  background-color: #444;
}

.hover-image-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
}

.hover-image {
  width: 500px;
  max-width: 80vw;
  height: auto;
  object-fit: contain;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.info-box:hover .hover-image {
  transform: scale(1.1);
}
</style>
