<template>
  <header
      class="bg-gray-200/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
  >
    <UContainer class="flex flex-wrap items-center justify-between h-14">
      <!-- Logo + Home -->
      <div class="flex items-center gap-x-4">
        <ULink
            class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
            to="/"
        >
          <img src="https://randomuser.me/api/portraits/men/1.jpg" class="profile w-8 h-8" alt="john" /> Eddy
        </ULink>
      </div>

      <!-- Role -->
      <div class="flex-1 text-center text-xl md:text-2xl text-primary md:ml-24">
        <span>Student</span>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-x-2">
        <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500 ms-auto"
        />
        <span>{{ credits }}</span>

        <ULink class="text-m md:text-m text-primary flex items-center gap-x-2" to="/store"> Store </ULink>
        <ULink class="text-m md:text-m text-primary flex items-center gap-x-2" to="https://forms.gle/dDxMkSmAa1yJNuL28">
          Feedback
        </ULink>

        <ColorMode />
      </div>

      <!-- Mobile Menu Button -->
      <div class="block md:hidden">
        <button @click="showMobileMenu = !showMobileMenu" class="focus:outline-none">
          <UIcon
            name="i-heroicons-bars-3-16-solid"
            class="flex-shrink-0 h-5 w-5 mt-1"
          />
        </button>
      </div>
    </UContainer>

    <!-- Mobile Menu Dropdown -->
    <div v-if="showMobileMenu" class="md:hidden px-4 pb-4">
      <div class="flex items-center gap-x-2 mb-2">
        <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500"
        />
        <span>{{ credits }}</span>
      </div>

      <div class="flex flex-col gap-y-2">
        <ULink class="text-primary" to="/store">Store</ULink>
        <ULink class="text-primary" to="https://forms.gle/dDxMkSmAa1yJNuL28">Feedback</ULink>
        <ColorMode />
      </div>
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
          credits.value = newCredits[0];
        }
    );

    return {
      credits,
      isParent,
      showMobileMenu
    };
  }
};
</script>

<style scoped>
.profile {
  border-radius: 50%;
}
</style>
