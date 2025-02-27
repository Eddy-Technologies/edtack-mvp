<template>
  <div class="home">
    <AppHeader />
    <main class="main-content">
      <AppContainer />
    </main>
    <!-- <AppFooter /> -->
  </div>
</template>

<script>
import { useCreditStore } from "~/stores/credit"; // Import your store

export default {
  setup() {
    let credits = ref(0);
    const creditStore = useCreditStore();

    onMounted(() => {
      credits.value = creditStore.count || 0
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

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image fills the entire container */
}
</style>
