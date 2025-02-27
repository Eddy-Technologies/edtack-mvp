<template>
  <div class="home">
    <AppHeader />
    <main class="flex items-center justify-center flex-col m-20">
      <Children />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import Fund from "~/pages/parent/Fund.vue";
import Children from "~/pages/parent/Children.vue";
import {ref} from "vue";

const child = ref(null);
</script>

<style lang="scss" scoped>

</style>
