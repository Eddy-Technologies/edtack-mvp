<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p class="text-gray-600">Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="flex items-center justify-center w-12 h-12 mx-auto text-red-400 mb-4">
        <UIcon name="i-lucide-alert-circle" size="48" />
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <Button
        variant="primary"
        text="Try Again"
        @clicked="loadTasks"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Action Button -->
      <div v-if="isParent" class="flex justify-end">
        <Button
          variant="primary"
          text="Create Task"
          icon="i-lucide-plus"
          @clicked="showCreateModal = true"
        />
      </div>

      <!-- Filters and Stats -->
      <div class="bg-white rounded-lg border p-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Sort Dropdown -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              v-model="sortBy"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              @change="handleSortChange"
            >
              <option value="created_at">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="due_date">Due Date</option>
              <option value="credit_asc">Credits (High to Low)</option>
              <option value="credit">Credits (Low to High)</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center gap-4">
            <select
              v-model="selectedStatus"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              @change="() => { currentPage = 1; loadTasks(1); }"
            >
              <option value="">All Tasks</option>
              <option value="OPEN">Open</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <!-- Clear Filter -->
            <Button
              v-if="selectedStatus"
              variant="secondary"
              text="Clear Filter"
              size="sm"
              @clicked="clearFilters"
            />
          </div>

          <!-- Stats -->
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span>{{ pagination?.totalCount || 0 }} total tasks</span>
            <span v-if="pendingCredits > 0" class="text-green-600 font-medium">
              {{ pendingCredits }} credits pending
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination Top -->
      <Pagination
        v-if="!isLoading && pagination"
        :pagination="pagination"
        :is-loading="isLoading"
        item-label="tasks"
        @go-to-page="goToPage"
        @change-limit="changeItemsPerPage"
      />

      <!-- Empty State -->
      <div v-if="!isLoading && tasks.length === 0" class="text-center py-16 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
          <UIcon name="i-lucide-clipboard-list" size="64" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ isParent ? 'No tasks created yet' : 'No tasks assigned yet' }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{ isParent ? 'Create your first task to get started!' : 'Ask your parent to create some tasks for you.' }}
        </p>
        <Button
          v-if="isParent"
          variant="primary"
          text="Create First Task"
          icon="i-lucide-plus"
          @clicked="showCreateModal = true"
        />
      </div>

      <!-- Tasks List -->
      <div v-else-if="tasks.length > 0" class="space-y-4">
        <TaskInfoCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :is-parent="isParent"
          :show-assignee-info="isParent"
          @close-task="closeTask"
        />
      </div>
    </div>
  </div>

  <!-- Create Task Modal -->
  <CreateTaskModal
    :is-open="showCreateModal"
    @close="showCreateModal = false"
    @task-created="onTaskCreated"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '~/components/common/Button.vue';
import Pagination from '~/components/common/Pagination.vue';
import CreateTaskModal from '~/components/dashboard/tasks/CreateTaskModal.vue';
import TaskInfoCard from '~/components/dashboard/tasks/TaskInfoCard.vue';

// Use stores
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);
const codesStore = useCodesStore();

// Reactive state
const tasks = ref<any[]>([]);
const pagination = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
// Removed local isParent - using store instead

// Modal states
const showCreateModal = ref(false);

// Filter state
const selectedStatus = ref('');

// Pagination and sorting states
const currentPage = ref(1);
const itemsPerPage = ref(5);
const sortBy = ref('created_at');
const sortOrder = ref('desc');

const pendingCredits = computed(() => {
  // For task threads, completed means credits have been awarded
  // For user tasks, this doesn't apply (they're templates)
  return tasks.value
    .filter((task) => task.isThread && task.status === 'COMPLETED')
    .reduce((total, task) => total + task.credit, 0);
});

// Functions
const loadTasks = async (page = 1) => {
  try {
    isLoading.value = true;
    error.value = null;

    const offset = (page - 1) * itemsPerPage.value;
    const actualSortBy = sortBy.value === 'created_at_asc' ?
      'created_at' :
      sortBy.value === 'credit_asc' ? 'credit' : sortBy.value;
    const actualSortOrder = sortBy.value === 'created_at_asc' || sortBy.value === 'credit_asc' ? 'asc' : sortOrder.value;

    // Use appropriate endpoint based on user role
    const endpoint = isParent.value ? '/api/tasks/user-tasks' : '/api/tasks/threads';
    const response = await $fetch(endpoint, {
      query: {
        status: selectedStatus.value,
        limit: itemsPerPage.value,
        offset,
        sortBy: actualSortBy,
        sortOrder: actualSortOrder
      }
    });

    if (response.success) {
      // Extract tasks from the appropriate response field
      tasks.value = isParent.value ? (response.tasks || []) : (response.threads || []);
      pagination.value = response.pagination;
      currentPage.value = page;
    } else {
      throw new Error('Failed to load tasks');
    }
  } catch (err: any) {
    console.error('Failed to load tasks:', err);
    error.value = err.data?.message || 'Failed to load tasks. Please try again.';
    tasks.value = [];
    pagination.value = null;
  } finally {
    isLoading.value = false;
  }
};

const closeTask = async (task: any) => {
  if (!confirm(`Are you sure you want to close the task "${task.name}"? This will stop generating new instances.`)) {
    return;
  }

  try {
    const response = await $fetch(`/api/tasks/${task.id}/close`, {
      method: 'POST'
    });

    if (response.success) {
      // Update task status locally
      const taskToUpdate = tasks.value.find((t) => t.id === task.id);
      if (taskToUpdate) {
        taskToUpdate.status = 'CLOSED';
      }
    }
  } catch (err: any) {
    console.error('Failed to close task:', err);
    alert(err.data?.message || 'Failed to close task');
  }
};

const onTaskCreated = () => {
  showCreateModal.value = false;
  loadTasks();
};

const clearFilters = () => {
  selectedStatus.value = '';
  currentPage.value = 1;
  loadTasks(1);
};

const goToPage = (page: number) => {
  if (page >= 1 && pagination.value && page <= pagination.value.totalPages) {
    loadTasks(page);
  }
};

const changeItemsPerPage = (newLimit: number) => {
  itemsPerPage.value = newLimit;
  currentPage.value = 1;
  loadTasks(1);
};

const handleSortChange = () => {
  currentPage.value = 1;
  loadTasks(1);
};

// Load tasks on mount
onMounted(() => {
  loadTasks(1);
});
</script>
