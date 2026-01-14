<template>
  <div class="bg-white rounded-lg border transition-shadow p-6">
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
          <div class="flex items-center space-x-1 text-secondary">
            <UIcon name="i-lucide-coins" size="16" />
            <span class="text-black">
              {{ task.credit }} credits per chapter • {{ task.chapters.length }} chapter{{ task.chapters.length === 1 ? '' : 's' }} assigned
            </span>
          </div>

          <div v-if="showAssigneeInfo" class="flex items-center space-x-1">
            <UIcon name="i-lucide-user" size="16" />
            <span>{{ task.assigneeInfo?.firstName }} {{ task.assigneeInfo?.lastName || 'Unknown Child' }}</span>
          </div>
        </div>

        <!-- Chapter Information -->
        <div v-if="task.chapters?.length" class="p-3 rounded-lg mb-3 border border-primary bg-primary-50">
          <p class="text-sm text-primary-800 font-medium mb-2">
            Chapters:
          </p>
          <div class="space-y-2">
            <div
              v-for="chapter in task.chapters"
              :key="chapter.id || chapter.name"
              class="flex items-center justify-between bg-white rounded-md p-2 border border-primary-200"
            >
              <span class="text-xs font-medium text-primary-800">
                {{ chapter.display_name || chapter.name }}
              </span>
              <!-- View Attempts Button for Parents -->
              <Button
                v-if="isParent && chapter.completed_at"
                variant="secondary"
                text="View Attempts"
                size="xs"
                icon="i-lucide-eye"
                @clicked="$emit('view-attempts', chapter, task)"
              />
              <span
                v-else-if="isParent && !chapter.completed_at"
                class="text-xs text-gray-500"
              >
                Not attempted
              </span>
            </div>
          </div>
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
  (e: 'view-attempts', chapter: any, task: any): void;
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
    OPEN: 'bg-primary-100 text-primary-800',
    COMPLETED: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    // Task statuses (uppercase)
    CLOSED: 'bg-gray-100 text-gray-800',
  };
  return classMap[status as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};
</script>
