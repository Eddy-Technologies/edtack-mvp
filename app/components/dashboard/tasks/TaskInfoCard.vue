<template>
  <div class="bg-white rounded-lg border hover:shadow-md transition-shadow p-6">
    <div class="flex items-start justify-between">
      <!-- Task Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-3 mb-2">
          <h3 class="text-lg font-semibold text-gray-900">{{ task.name }}</h3>
          <span :class="getStatusBadgeClass(task.status)" class="px-2 py-1 rounded-full text-xs font-medium">
            {{ getStatusText(task.status) }}
          </span>
        </div>

        <p v-if="task.subtitle" class="text-gray-600 mb-2">{{ task.subtitle }}</p>
        <p v-if="task.description" class="text-gray-700 mb-3">{{ task.description }}</p>

        <!-- Task Details -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
          <div class="flex items-center space-x-1">
            <UIcon name="i-lucide-coins" size="16" />
            <span class="font-medium text-green-600">{{ formatCredits(task.credit) }}</span>
          </div>

          <div v-if="showAssigneeInfo" class="flex items-center space-x-1">
            <UIcon name="i-lucide-user" size="16" />
            <span>{{ task.assigneeInfo?.firstName }} {{ task.assigneeInfo?.lastName || 'Unknown Child' }}</span>
          </div>
        </div>

        <!-- Chapter Information -->
        <div v-if="task.chapters?.length" class="bg-blue-50 p-3 rounded-lg mb-3">
          <p class="text-sm text-blue-800 font-medium mb-2">
            Chapters:
          </p>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="chapter in task.chapters"
              :key="chapter.name"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
            >
              {{ chapter.display_name || chapter.name }}
            </span>
          </div>
          <p class="text-xs text-blue-600">
            {{ task.credit }} credits per quiz • {{ task.chapters.length }} chapter{{ task.chapters.length === 1 ? '' : 's' }} assigned
          </p>
        </div>

        <!-- Recurring Task Info -->
        <div v-if="!task.isThread && task.isRecurring" class="bg-purple-50 p-3 rounded-lg mb-3">
          <p class="text-sm text-purple-800">
            <strong>Recurring:</strong> {{ task.recurrenceFrequency?.toLowerCase().replace('_', ' ') || 'Unknown frequency' }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col space-y-2 ml-4">
          <!-- Parent Actions -->
          <template v-if="isParent">
            <div v-if="!task.isThread">
              <Button
                v-if="task.status === 'OPEN'"
                variant="secondary"
                text="Close Task"
                size="sm"
                @clicked="$emit('close-task', task)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/common/Button.vue';

interface Props {
  task: any;
  isParent: boolean;
  showAssigneeInfo?: boolean;
}

withDefaults(defineProps<Props>(), {
  showAssigneeInfo: true
});

defineEmits<{
  (e: 'close-task', task: any): void;
}>();

// Utility functions
const getStatusText = (status: string) => {
  const statusMap = {
    // Task thread statuses (uppercase)
    OPEN: 'Open',
    COMPLETED: 'Completed',
    EXPIRED: 'Expired',
    // Task statuses (uppercase)
    CLOSED: 'Closed',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classMap = {
    // Task thread statuses (uppercase)
    OPEN: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    // Task statuses (uppercase)
    CLOSED: 'bg-gray-100 text-gray-800',
  };
  return classMap[status as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};

const formatCredits = (credits: number) => {
  return `${credits} credits`;
};
</script>
