<template>
  <header class="sticky top-0 z-50 bg-gray-200 backdrop-blur border-b border-gray-200">
    <div class="w-full flex flex-wrap justify-between items-center h-14 px-6">
      <!-- Logo -->
      <div class="flex items-center gap-x-4">
        <ULink class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2" to="/">
          <img
            src="https://randomuser.me/api/portraits/men/3.jpg"
            class="w-8 h-8 rounded-full"
            alt="john"
          >
          Eddy
        </ULink>
      </div>
      <HeaderMenu :credits="credits" />
    </div>
  </header>
</template>

<script>
import { ref, watch } from 'vue';
import { useCreditStore } from '~/stores/credit';
import { useProfileStore } from '~/stores/profile';

export default {
  setup() {
    const creditStore = useCreditStore();
    const profileStore = useProfileStore();
    const isParent = profileStore.profile === '/parent';
    const defaultChild = creditStore.childCredits[0];
    const credits = ref(isParent ? creditStore.parentCredits : defaultChild);
    const showMobileMenu = ref(false);

    watch(
      () => (isParent ? creditStore.parentCredits : creditStore.childCredits),
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
