<template>
  <div class="h-full overflow-y-auto">
    <div class="p-4 sm:p-6 min-h-full w-full max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-4 sm:mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Family</h2>
      </div>

      <!-- Sub-Tab Content -->
      <div>
        <FamilyManagementTab v-if="currentSubtab === 'management'" />
        <FamilyOrderRequestsTab v-else-if="currentSubtab === 'order-requests'" />
        <FamilyManagementTab v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import FamilyManagementTab from './family/FamilyManagementTab.vue';
import FamilyOrderRequestsTab from './family/FamilyOrderRequestsTab.vue';

const route = useRoute();

// Get current subtab from route query or default to 'management'
const currentSubtab = computed(() => {
  return (route.query.subtab as string) || 'management';
});
</script>
