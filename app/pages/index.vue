<template>
  <div class="home">
    <AppHeader />
    <main class="main-content flex items-center justify-center h-screen">
      <AppContainer />
    </main>
    <AppFooter />
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
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 1rem;
  min-height: calc(100vh - 3.5rem);
}
</style>
