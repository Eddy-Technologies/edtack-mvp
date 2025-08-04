<template>
  <div class="dashboard-family">
    <div class="family-container">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Family</h2>
      </div>

      <!-- Sub-Tab Content -->
      <div class="family-content">
        <FamilyManagementTab v-if="currentSubtab === 'management'" />
        <FamilyOrderRequestsTab v-else-if="currentSubtab === 'order-requests'" />
        <FamilyTasksTab v-else-if="currentSubtab === 'tasks'" />
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
import FamilyTasksTab from './family/FamilyTasksTab.vue';

const route = useRoute();

// Get current subtab from route query or default to 'management'
const currentSubtab = computed(() => {
  return (route.query.subtab as string) || 'management';
});
</script>

<style scoped>
.dashboard-family {
  height: 100%;
  overflow-y: auto;
}

.family-container {
  padding: 20px;
  min-height: 100%;
  width: 100%;
  max-width: 6xl;
  margin: 0 auto;
}

.family-content {
  height: calc(100% - 120px);
}
</style>
