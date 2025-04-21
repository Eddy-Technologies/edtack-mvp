<template>
  <header
      class="bg-gray-200/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
  >
    <UContainer class="flex flex-wrap items-center justify-between h-14">
      <!-- Logo -->
      <div class="flex items-center gap-x-4">
        <ULink
            class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
            to="/"
        >
          <img src="https://randomuser.me/api/portraits/men/3.jpg" class="profile w-8 h-8" alt="john" /> Eddy
        </ULink>
      </div>

      <!-- Role -->
      <div class="flex-1 text-center text-xl md:text-2xl text-primary md:ml-24">
        <span>Parent</span>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-x-2">
        <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500 ms-auto"
        />
        <span>{{ credits }}</span>

        <ULink
            class="text-m text-primary flex items-center gap-x-2"
            to="https://forms.gle/dDxMkSmAa1yJNuL28"
        >
          Feedback
        </ULink>

        <ColorMode />
      </div>

      <!-- Mobile Menu Toggle -->
      <div class="block md:hidden">
        <button @click="showMobileMenu = !showMobileMenu" class="focus:outline-none">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </UContainer>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden px-4 pb-4 space-y-2">
      <div class="flex items-center gap-x-2">
        <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500"
        />
        <span>{{ credits }}</span>
      </div>

      <ULink
          class="block text-primary"
          to="https://forms.gle/dDxMkSmAa1yJNuL28"
      >
        Feedback
      </ULink>

      <ColorMode />
    </div>
  </header>
</template>

<script>
import { ref, watch } from 'vue';
import { useCreditStore } from "~/stores/credit";
import { useProfileStore } from "~/stores/profile";

export default {
  setup() {
    const creditStore = useCreditStore();
    const profileStore = useProfileStore();
    const isParent = profileStore.profile === "/parent";
    const defaultChild = creditStore.childCredits[0];
    const credits = ref(isParent ? creditStore.parentCredits : defaultChild);
    const showMobileMenu = ref(false);

    watch(
        () => isParent ? creditStore.parentCredits : creditStore.childCredits,
        (newCredits) => {
          credits.value = newCredits;
        }
    );

    return {
      credits,
      isParent,
      showMobileMenu,
    };
  },
};
</script>

<style scoped>
.profile {
  border-radius: 50%;
}
</style>
