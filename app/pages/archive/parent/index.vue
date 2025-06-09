<template>
  <div class="home">
    <AppHeader :is-parent="true" />
    <main class="flex flex-col">
      <Children />
    </main>
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup>
import Children from '~/pages/archive/parent/Children.vue';
</script>
