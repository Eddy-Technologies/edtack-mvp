<template>
  <header
      class="bg-gray-200/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
  >
    <UContainer class="flex flex-wrap items-center justify-between h-14">
      <div class="flex items-center gap-x-4">
        <ULink
            class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
            to="/"
        >
          <AppIcon class="w-12 h-12" /> Eddy
        </ULink>
      </div>
      <div class="flex items-center gap-x-2">
        <ULink
            class="text-m md:text-m text-primary flex items-center gap-x-2"
            to="https://forms.gle/dDxMkSmAa1yJNuL28"
        >
          Feedback
        </ULink>
        <ColorMode />
      </div>
    </UContainer>
  </header>
</template>

<script>
import { ref, watch } from 'vue';
import { useCreditStore } from "~/stores/credit"; // Import your store
import { useProfileStore } from "~/stores/profile";

export default {
  setup() {
    const creditStore = useCreditStore();
    const profileStore = useProfileStore();
    const isParent = profileStore.profile === "/parent";
    const defaultChild = creditStore.childCredits[0];
    const credits = ref(isParent ? creditStore.parentCredits : defaultChild);

    watch(
        () => isParent ? creditStore.parentCredits : creditStore.childCredits, // Watch the credits value in the store
        (newCredits) => {
          credits.value = newCredits; // Update the local ref when the store's value changes
        }
    );

    return {
      credits,
      isParent
    };
  }
};
</script>
