<template>
  <div class="home">
    <main class="main-content">
      <AppContainer />
    </main>
  </div>
</template>

<script>
import { useCreditStore } from "~/stores/credit"; // Import your store
import { useProfileStore } from "~/stores/profile";
export default {
  setup() {
    let credits = ref(0);
    const creditStore = useCreditStore();
    const profileStore = useProfileStore();
    const isParent = profileStore.profile === "/parent";
    onMounted(() => {
      credits.value = isParent ? creditStore.parentCredits : creditStore.childCredits[0];
    });

    return {
      credits
    };
  }
};
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ensures the home container takes up the full viewport height */

  @media (max-width: 768px) { // Adjust layout for mobile screens
    margin-top: -60px;
  }
}

.main-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%; /* Make sure the container takes full height available */
}

.AppContainer {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
