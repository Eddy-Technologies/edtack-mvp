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

          <div v-if="task.category" class="flex items-center space-x-1">
            <UIcon name="i-lucide-tag" size="16" />
            <span>{{ task.category }}</span>
          </div>

          <div v-if="task.dueDate" class="flex items-center space-x-1">
            <UIcon name="i-lucide-calendar" size="16" />
            <span :class="{ 'text-red-600': isOverdue(task.dueDate) }">
              Due {{ formatDate(task.dueDate) }}
            </span>
          </div>

          <div v-if="showAssigneeInfo" class="flex items-center space-x-1">
            <UIcon name="i-lucide-user" size="16" />
            <span>{{ task.assigneeInfo?.firstName }} {{ task.assigneeInfo?.lastName || 'Unknown Child' }}</span>
          </div>
        </div>

        <!-- Task Thread Info -->
        <div v-if="task.isThread" class="bg-blue-50 p-3 rounded-lg mb-3">
          <p class="text-sm text-blue-800">
            <strong>Quiz Details:</strong> {{ task.questionsPerQuiz }} questions • Need {{ task.requiredScore }}% to pass
          </p>
        </div>

        <!-- Recurring Task Info -->
        <div v-if="!task.isThread && task.isRecurring" class="bg-purple-50 p-3 rounded-lg mb-3">
          <p class="text-sm text-purple-800">
            <strong>Recurring:</strong> {{ task.recurrenceFrequency?.toLowerCase().replace('_', ' ') || 'Unknown frequency' }}
          </p>
        </div>

        <!-- Timestamps -->
        <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>{{ task.isThread ? 'Thread created' : 'Task created' }} {{ formatDate(task.createdAt) }}</span>
          <span v-if="task.dueDate && task.isThread">
            Due {{ formatDate(task.dueDate) }}
          </span>
        </div>
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
</template>

<script setup lang="ts">
import Button from '~/components/common/Button.vue';

interface Props {
  task: any;
  isParent: boolean;
  showAssigneeInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAssigneeInfo: true
});

const emit = defineEmits<{
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

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) return 'N/A';

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

const isOverdue = (dueDateString: string) => {
  return new Date(dueDateString) < new Date();
};
</script>
