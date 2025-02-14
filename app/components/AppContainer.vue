<template>
  <div class="app-container">
    <Home />
  </div>
</template>

<script>
import Home from '../../app/pages/home.vue';

export default {
  components: {
    Home
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
