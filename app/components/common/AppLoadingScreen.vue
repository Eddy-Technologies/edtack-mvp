<template>
  <Transition name="fade" @after-leave="$emit('after-leave')">
    <div v-if="show" class="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden">
      <!-- Decorative floating particles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="floating-dot dot-1" />
        <div class="floating-dot dot-2" />
        <div class="floating-dot dot-3" />
        <div class="floating-dot dot-4" />
        <div class="floating-dot dot-5" />
      </div>

      <!-- Main content -->
      <div class="text-center relative z-10">
        <AppIcon :name="icon" class="w-20 h-20 text-teal-500 mb-6 mx-auto animate-float drop-shadow-lg" />
        <h1 class="text-4xl md:text-6xl font-bold text-gray-800 animate-fade-in-up">
          <span>{{ title }}</span>
          <span class="shimmer-text">{{ highlight }}</span>
        </h1>
        <p v-if="subtitle" class="text-gray-600 mt-4 animate-fade-in-up animation-delay-200">{{ subtitle }}</p>
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

/* Floating icon animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Shimmer effect for highlight text */
.shimmer-text {
  background: linear-gradient(
    90deg,
    #0d9488 0%,
    #14b8a6 25%,
    #5eead4 50%,
    #14b8a6 75%,
    #0d9488 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Fade in up animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}

/* Floating decorative dots */
.floating-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #14b8a6;
  border-radius: 50%;
  opacity: 0.2;
  animation: float-particle 4s ease-in-out infinite;
}

@keyframes float-particle {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-30px) scale(1.3);
    opacity: 0.4;
  }
}

.dot-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.dot-2 {
  top: 60%;
  left: 10%;
  animation-delay: 1s;
  width: 6px;
  height: 6px;
}

.dot-3 {
  top: 30%;
  right: 20%;
  animation-delay: 2s;
  width: 10px;
  height: 10px;
}

.dot-4 {
  top: 70%;
  right: 15%;
  animation-delay: 0.5s;
}

.dot-5 {
  top: 45%;
  right: 8%;
  animation-delay: 1.5s;
  width: 5px;
  height: 5px;
}
</style>
