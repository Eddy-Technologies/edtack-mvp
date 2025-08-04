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
              <option value="priority">Priority (High to Low)</option>
              <option value="created_at">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="due_date">Due Date</option>
              <option value="credit">Credits (High to Low)</option>
              <option value="credit_asc">Credits (Low to High)</option>
            </select>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-4 items-center">
            <!-- Status Filter -->
            <select
              v-model="selectedStatus"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              @change="() => { currentPage = 1; loadTasks(1); }"
            >
              <option value="">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <!-- Priority Filter -->
            <select
              v-model="selectedPriority"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              @change="() => { currentPage = 1; loadTasks(1); }"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              @change="() => { currentPage = 1; loadTasks(1); }"
            >
              <option value="">All Categories</option>
              <option value="chores">Chores</option>
              <option value="homework">Homework</option>
              <option value="behavior">Behavior</option>
              <option value="exercise">Exercise</option>
              <option value="reading">Reading</option>
              <option value="other">Other</option>
            </select>

            <!-- Clear Filters -->
            <Button
              v-if="hasActiveFilters"
              variant="secondary"
              text="Clear Filters"
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
        <div
          v-for="task in tasks"
          :key="task.id"
          class="bg-white rounded-lg border hover:shadow-md transition-shadow p-6"
        >
          <div class="flex items-start justify-between">
            <!-- Task Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ task.name }}</h3>
                <span :class="getStatusBadgeClass(task.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getStatusText(task.status) }}
                </span>
                <span :class="getPriorityBadgeClass(task.priority)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ task.priority.toUpperCase() }}
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

                <div v-if="isParent" class="flex items-center space-x-1">
                  <UIcon name="i-lucide-user" size="16" />
                  <span>{{ task.assigneeInfo?.firstName }} {{ task.assigneeInfo?.lastName || 'Unknown Child' }}</span>
                </div>
              </div>

              <!-- Completion Notes -->
              <div v-if="task.completionNotes" class="bg-blue-50 p-3 rounded-lg mb-3">
                <p class="text-sm text-blue-800">
                  <strong>Completion Notes:</strong> {{ task.completionNotes }}
                </p>
              </div>

              <!-- Approval Notes -->
              <div v-if="task.approvalNotes" class="bg-gray-50 p-3 rounded-lg mb-3">
                <p class="text-sm text-gray-800">
                  <strong>{{ task.status === 'approved' ? 'Approval' : 'Rejection' }} Notes:</strong>
                  {{ task.approvalNotes }}
                </p>
              </div>

              <!-- Timestamps -->
              <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span>Created {{ formatDate(task.createdAt) }}</span>
                <span v-if="task.completedAt">Completed {{ formatDate(task.completedAt) }}</span>
                <span v-if="task.approvedAt">
                  {{ task.status === 'approved' ? 'Approved' : 'Reviewed' }} {{ formatDate(task.approvedAt) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col space-y-2 ml-4">
              <!-- Child Actions -->
              <template v-if="!isParent">
                <Button
                  v-if="task.status === 'pending'"
                  variant="primary"
                  text="Start Task"
                  size="sm"
                  @clicked="startTask(task.id)"
                />
                <Button
                  v-else-if="task.status === 'in_progress'"
                  variant="primary"
                  text="Complete Task"
                  size="sm"
                  @clicked="completeTask(task)"
                />
              </template>

              <!-- Parent Actions -->
              <template v-else>
                <div v-if="task.status === 'completed'" class="flex space-x-2">
                  <Button
                    variant="primary"
                    text="Approve"
                    size="sm"
                    @clicked="approveTask(task)"
                  />
                  <Button
                    variant="secondary"
                    text="Reject"
                    size="sm"
                    @clicked="rejectTask(task)"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Task Modal -->
  <CreateTaskModal
    :is-open="showCreateModal"
    @close="showCreateModal = false"
    @task-created="onTaskCreated"
  />

  <!-- Complete Task Modal -->
  <CompleteTaskModal
    :is-open="showCompleteModal"
    :task="selectedTask"
    @close="showCompleteModal = false"
    @task-completed="onTaskCompleted"
  />

  <!-- Approve/Reject Task Modal -->
  <ApproveTaskModal
    :is-open="showApproveModal"
    :task="selectedTask"
    :action="approveAction"
    @close="showApproveModal = false"
    @task-reviewed="onTaskReviewed"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '~/components/common/Button.vue';
import Pagination from '~/components/common/Pagination.vue';
import CreateTaskModal from '~/components/dashboard/tasks/CreateTaskModal.vue';
import CompleteTaskModal from '~/components/dashboard/tasks/CompleteTaskModal.vue';
import ApproveTaskModal from '~/components/dashboard/tasks/ApproveTaskModal.vue';

// Use me store for user role
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);

// Reactive state
const tasks = ref<any[]>([]);
const pagination = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
// Removed local isParent - using store instead

// Modal states
const showCreateModal = ref(false);
const showCompleteModal = ref(false);
const showApproveModal = ref(false);
const selectedTask = ref<any>(null);
const approveAction = ref<'approve' | 'reject'>('approve');

// Filter states
const selectedStatus = ref('');
const selectedPriority = ref('');
const selectedCategory = ref('');

// Pagination and sorting states
const currentPage = ref(1);
const itemsPerPage = ref(5);
const sortBy = ref('priority');
const sortOrder = ref('desc');

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedStatus.value || selectedPriority.value || selectedCategory.value;
});

const pendingCredits = computed(() => {
  return tasks.value
    .filter((task) => task.status === 'completed')
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

    const response = await $fetch('/api/tasks/list', {
      query: {
        status: selectedStatus.value,
        priority: selectedPriority.value,
        category: selectedCategory.value,
        limit: itemsPerPage.value,
        offset,
        sortBy: actualSortBy,
        sortOrder: actualSortOrder
      }
    });

    if (response.success) {
      tasks.value = response.tasks || [];
      pagination.value = response.pagination;
      // Removed isParent assignment - using store instead
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

const startTask = async (taskId: string) => {
  try {
    const response = await $fetch(`/api/tasks/${taskId}/start`, {
      method: 'POST'
    });

    if (response.success) {
      // Update task status locally
      const task = tasks.value.find((t) => t.id === taskId);
      if (task) {
        task.status = 'in_progress';
      }
    }
  } catch (err: any) {
    console.error('Failed to start task:', err);
    alert(err.data?.message || 'Failed to start task');
  }
};

const completeTask = (task: any) => {
  selectedTask.value = task;
  showCompleteModal.value = true;
};

const approveTask = (task: any) => {
  selectedTask.value = task;
  approveAction.value = 'approve';
  showApproveModal.value = true;
};

const rejectTask = (task: any) => {
  selectedTask.value = task;
  approveAction.value = 'reject';
  showApproveModal.value = true;
};

const onTaskCreated = () => {
  showCreateModal.value = false;
  loadTasks();
};

const onTaskCompleted = () => {
  showCompleteModal.value = false;
  loadTasks();
};

const onTaskReviewed = () => {
  showApproveModal.value = false;
  loadTasks();
};

const clearFilters = () => {
  selectedStatus.value = '';
  selectedPriority.value = '';
  selectedCategory.value = '';
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

// Utility functions
const getStatusText = (status: string) => {
  const statusMap = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    expired: 'Expired'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800'
  };
  return classMap[status as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};

const getPriorityBadgeClass = (priority: string) => {
  const classMap = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };
  return classMap[priority as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
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

// Load tasks on mount
onMounted(() => {
  loadTasks(1);
});
</script>
