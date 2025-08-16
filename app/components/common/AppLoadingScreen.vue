<template>
  <Transition name="fade" @after-leave="$emit('after-leave')">
    <div v-if="show" class="fixed inset-0 z-[100] bg-white flex items-center justify-center">
      <div class="text-center">
        <AppIcon :name="icon" class="w-16 h-16 text-gray-500 mb-4" />
        <h1 class="text-4xl md:text-6xl font-bold text-gray-800">
          <span>{{ title }}</span>
          <span class="text-primary animate-pulse">{{ highlight }}</span>
        </h1>
        <p v-if="subtitle" class="text-gray-600 mt-4">{{ subtitle }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Welcome to ' },
  highlight: { type: String, default: 'StudyWithEddy' },
  subtitle: String,
  icon: { type: String, default: 'i-heroicons-sparkles' }
});

defineEmits(['after-leave']);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
