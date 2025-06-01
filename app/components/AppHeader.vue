<template>
  <ParentHeader v-if="isParent" />
  <ChildHeader v-else />
  <!-- <Header v-else /> -->
</template>

<script>
import { ref, watch } from 'vue';
import { useCreditStore } from '~/stores/credit'; // Import your store
import { useProfileStore } from '~/stores/profile';
import ParentHeader from '~/components/header/ParentHeader.vue';
import ChildHeader from '~/components/header/ChildHeader.vue';
import BaseHeader from '~/components/header/BaseHeader.vue';

export default {
  components: { BaseHeader, ChildHeader, ParentHeader },
  setup() {
    const creditStore = useCreditStore();
    const profileStore = useProfileStore();
    const isParent = profileStore.profile === '/parent';
    const isChild =
      profileStore.profile === '/child' ||
      profileStore.profile === '/challenge' ||
      profileStore.profile === '/practice';
    const defaultChild = creditStore.childCredits[0];
    const credits = ref(isParent ? creditStore.parentCredits : defaultChild);

    watch(
      () => (isParent ? creditStore.parentCredits : creditStore.childCredits), // Watch the credits value in the store
      (newCredits) => {
        credits.value = newCredits; // Update the local ref when the store's value changes
      }
    );

    return {
      credits,
      isParent,
      isChild,
    };
  },
};
</script>
