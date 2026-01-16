<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Overview Header -->
    <!-- <OverviewHeader /> -->

    <!-- Parent/Student conditional - wrapped in ClientOnly to prevent SSR hydration mismatch -->
    <ClientOnly>
      <template v-if="isParent">
        <!-- Token Usage Summary -->
        <TokenUsageCard />

        <!-- Pending Order Requests -->
        <div v-if="pendingOrders.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-7 sm:w-8 h-7 sm:h-8 bg-amber-100 rounded-lg">
                  <UIcon name="i-lucide-shopping-cart" class="text-amber-600" size="16" />
                </div>
                <h3 class="text-sm sm:text-base font-semibold text-gray-900">Pending Order Requests</h3>
              </div>
              <NuxtLink to="/dashboard?tab=family&subtab=order-requests">
                <Button variant="secondary" text="View More" size="sm" />
              </NuxtLink>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="order in pendingOrders.slice(0, 5)" :key="order.id" class="flex items-center justify-between p-3 sm:p-5 hover:bg-gray-50/50 transition-colors">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl">
                  <UIcon name="i-lucide-shopping-cart" class="text-amber-600" size="18" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Order #{{ order.orderNumber }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm text-gray-500">{{ order.child.name }} • {{ order.itemCount }} items</span>
                    <span class="px-2 py-0.5 rounded-md text-xs font-medium" :class="getOrderStatusBadgeClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">S${{ order.totalAmountSGD }}</p>
                <p class="text-xs text-gray-500">({{ Math.round(order.totalAmountSGD * 100) }} credits)</p>
                <p class="text-xs text-gray-400">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Tasks -->
        <div v-if="pendingTasks.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-7 sm:w-8 h-7 sm:h-8 bg-blue-100 rounded-lg">
                  <UIcon name="i-lucide-clipboard-list" class="text-blue-600" size="16" />
                </div>
                <h3 class="text-sm sm:text-base font-semibold text-gray-900">Pending Tasks</h3>
              </div>
              <NuxtLink to="/dashboard?tab=family&subtab=tasks">
                <Button variant="secondary" text="View More" size="sm" />
              </NuxtLink>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="task in pendingTasks.slice(0, 5)" :key="task.id" class="flex items-center justify-between p-3 sm:p-5 hover:bg-gray-50/50 transition-colors">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
                  <UIcon name="i-lucide-clipboard-list" class="text-blue-600" size="18" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ task.name }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm text-gray-500">{{ task.assigneeInfo.firstName }} {{ task.assigneeInfo.lastName }}</span>
                    <span class="px-2 py-0.5 rounded-md text-xs font-medium" :class="getTaskStatusBadgeClass(task.status)">
                      {{ task.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-emerald-600">+{{ task.credit }} credits</p>
                <p class="text-xs text-gray-400">{{ formatDate(task.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Children Overview -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-7 sm:w-8 h-7 sm:h-8 bg-emerald-100 rounded-lg">
                  <UIcon name="i-lucide-users" class="text-emerald-600" size="16" />
                </div>
                <h3 class="text-sm sm:text-base font-semibold text-gray-900">Student Overview</h3>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-lg">
                  <UIcon name="i-lucide-users" class="text-blue-600" size="14" />
                  <span class="text-xs sm:text-sm font-semibold text-blue-700">{{ stats.totalChildren }}</span>
                  <span class="text-xs text-blue-600">Total</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 rounded-lg">
                  <UIcon name="i-lucide-activity" class="text-emerald-600" size="14" />
                  <span class="text-xs sm:text-sm font-semibold text-emerald-700">{{ stats.activeToday }}</span>
                  <span class="text-xs text-emerald-600">Active</span>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6">
            <div v-if="familyMembers.length === 0" class="text-center py-16 px-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
                <UIcon name="i-lucide-users" class="text-gray-400" size="32" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No students in your family yet</h3>
              <p class="text-gray-500 max-w-sm mx-auto mb-6">Invite students to your family group to see their progress here.</p>
              <NuxtLink to="/dashboard?tab=family">
                <Button variant="primary" text="Manage Family" icon="i-lucide-users" />
              </NuxtLink>
            </div>
            <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              <div v-for="student in familyMembers" :key="student.id" class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div class="relative flex-shrink-0">
                    <div class="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-emerald-100 rounded-xl">
                      <span class="text-emerald-700 font-semibold text-sm sm:text-base">{{ getInitials(student.userDisplayFullName || student.email) }}</span>
                    </div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" :class="student.isActive ? 'bg-emerald-500' : 'bg-gray-300'" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="font-semibold text-gray-900 truncate">{{ student.userDisplayFullName || student.email }}</h4>
                    <p class="text-sm text-gray-500">Student Account</p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-400 mb-3 sm:mb-4">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-coins" size="12" />
                    <span class="font-medium text-gray-600">{{ student.credits || 0 }}</span>
                    <span>credits</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-list-checks" size="12" />
                    <span>{{ student.activeTasks || 0 }} tasks</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" size="12" />
                    <span>Joined {{ formatDate(student.joined_at) }}</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <NuxtLink :to="`/dashboard?tab=family`" class="flex-1">
                    <button class="w-full px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
                      View Details
                    </button>
                  </NuxtLink>
                  <NuxtLink to="/dashboard?tab=tasks" class="flex-1">
                    <button class="w-full px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      Manage Tasks
                    </button>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Student View: Personal Overview -->
      <template v-else>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-emerald-50 rounded-lg">
                <UIcon name="i-lucide-coins" class="text-emerald-600" size="20" />
              </div>
              <div>
                <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ userCredits }}</p>
                <p class="text-xs text-gray-500">Available Credits</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-blue-50 rounded-lg">
                <UIcon name="i-lucide-clipboard-list" class="text-blue-600" size="20" />
              </div>
              <div>
                <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ activeTasks }}</p>
                <p class="text-xs text-gray-500">Active Tasks</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Token Usage Summary -->

        <TokenUsageCard />

        <!-- My Pending Orders -->
        <div v-if="myPendingOrders.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-7 sm:w-8 h-7 sm:h-8 bg-amber-100 rounded-lg">
                  <UIcon name="i-lucide-shopping-cart" class="text-amber-600" size="16" />
                </div>
                <h3 class="text-sm sm:text-base font-semibold text-gray-900">My Pending Orders</h3>
              </div>
              <NuxtLink to="/dashboard?tab=family&subtab=order-requests">
                <Button variant="secondary" text="View More" size="sm" />
              </NuxtLink>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="order in myPendingOrders.slice(0, 5)" :key="order.id" class="flex items-center justify-between p-3 sm:p-5 hover:bg-gray-50/50 transition-colors">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl">
                  <UIcon name="i-lucide-shopping-cart" class="text-amber-600" size="18" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 text-sm sm:text-base">Order #{{ order.orderNumber }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs sm:text-sm text-gray-500">{{ order.itemCount }} items</span>
                    <span class="px-2 py-0.5 rounded-md text-xs font-medium" :class="getOrderStatusBadgeClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">S${{ order.totalAmountSGD }}</p>
                <p class="text-xs text-gray-500">({{ Math.round(order.totalAmountSGD * 100) }} credits)</p>
                <p class="text-xs text-gray-400">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- My Pending Tasks -->
        <div v-if="myPendingTasks.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-7 sm:w-8 h-7 sm:h-8 bg-blue-100 rounded-lg">
                  <UIcon name="i-lucide-clipboard-list" class="text-blue-600" size="16" />
                </div>
                <h3 class="text-sm sm:text-base font-semibold text-gray-900">My Pending Tasks</h3>
              </div>
              <NuxtLink to="/dashboard?tab=family&subtab=tasks">
                <Button variant="secondary" text="View More" size="sm" />
              </NuxtLink>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="task in myPendingTasks.slice(0, 5)" :key="task.id" class="flex items-center justify-between p-3 sm:p-5 hover:bg-gray-50/50 transition-colors">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
                  <UIcon name="i-lucide-clipboard-list" class="text-blue-600" size="18" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 text-sm sm:text-base">{{ task.name }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 rounded-md text-xs font-medium" :class="getTaskStatusBadgeClass(task.status)">
                      {{ task.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-emerald-600">+{{ task.credit }} credits</p>
                <p class="text-xs text-gray-400">{{ formatDate(task.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <NuxtLink to="/dashboard?tab=shop" class="block">
            <div class="bg-white p-3 sm:p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-indigo-50 rounded-lg">
                  <UIcon name="i-lucide-shopping-bag" class="text-indigo-600" size="20" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm sm:text-base">Visit Shop</h3>
                  <p class="text-xs sm:text-sm text-gray-500">Spend your credits on rewards</p>
                </div>
              </div>
            </div>
          </NuxtLink>
          <NuxtLink to="/dashboard?tab=family" class="block">
            <div class="bg-white p-3 sm:p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-blue-50 rounded-lg">
                  <UIcon name="i-lucide-users" class="text-blue-600" size="20" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm sm:text-base">View Family</h3>
                  <p class="text-xs sm:text-sm text-gray-500">See your family connections</p>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>

      <template #fallback>
        <div class="animate-pulse space-y-4">
          <div class="h-32 bg-gray-200 rounded-xl" />
          <div class="h-48 bg-gray-200 rounded-xl" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import TokenUsageCard from '~/components/tokens/TokenUsageCard.vue';
import { useMeStore } from '~/stores/me';
import Button from '~/components/common/Button.vue';
import { ORDER_STATUS, TASK_STATUS } from '~~/shared/constants/codes';

const { formatDate } = useDateFormat();

const user = useMeStore();

// Check if user is parent
const isParent = computed(() => user.user_role === 'PARENT');

// Family members data
const familyMembers = ref<any[]>([]);
const userCredits = ref(0);
const activeTasks = ref(0);

// Pending orders and tasks for parent view
const pendingOrders = ref<any[]>([]);
const pendingTasks = ref<any[]>([]);

// Pending orders and tasks for student view
const myPendingOrders = ref<any[]>([]);
const myPendingTasks = ref<any[]>([]);

// Load family data for parents or personal data for students
onMounted(async () => {
  try {
    if (isParent.value) {
      // Load all parent data in parallel
      const [familyResult, ordersResult, tasksResult] = await Promise.allSettled([
        $fetch('/api/family/list'),
        $fetch('/api/orders/pending-approval', {
          query: { status: ORDER_STATUS.PENDING_PARENT_APPROVAL, limit: 5 }
        }),
        $fetch('/api/tasks/user-tasks', {
          query: { status: TASK_STATUS.OPEN, limit: 5 }
        })
      ]);

      if (familyResult.status === 'fulfilled' && familyResult.value.success) {
        familyMembers.value =
          familyResult.value.familyMembers?.filter((member: any) => member.status === 'active') || [];
      }
      if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
        pendingOrders.value = ordersResult.value.orders || [];
      }
      if (tasksResult.status === 'fulfilled' && tasksResult.value.success) {
        pendingTasks.value = tasksResult.value.tasks || [];
      }
    } else {
      // Load all student data in parallel
      const [creditsResult, ordersResult, tasksResult] = await Promise.allSettled([
        $fetch('/api/credits/unified'),
        $fetch('/api/orders/pending-approval', { query: { limit: 5 } }),
        $fetch('/api/tasks/user-tasks', { query: { status: TASK_STATUS.OPEN, limit: 5 } })
      ]);

      if (creditsResult.status === 'fulfilled') {
        userCredits.value = creditsResult.value.user?.balance || 0;
      }
      if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
        myPendingOrders.value = ordersResult.value.orders || [];
      }
      if (tasksResult.status === 'fulfilled' && tasksResult.value.success) {
        myPendingTasks.value = tasksResult.value.tasks || [];
        activeTasks.value = myPendingTasks.value.length;
      }
    }
  } catch (error) {
    console.error('Failed to load overview data:', error);
  }
});

const stats = computed(() => {
  return {
    totalChildren: familyMembers.value.length,
    activeToday: familyMembers.value.filter((member: any) => member.isActive).length
  };
});

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Get status display text for orders
const getStatusText = (status: string) => {
  const statusMap = {
    pending_parent_approval: 'Awaiting Approval',
    paid: 'Paid',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    rejected: 'Rejected'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// Get badge classes for order status
const getOrderStatusBadgeClass = (status: string) => {
  const classMap = {
    pending_parent_approval: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  };
  return classMap[status as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};

// Get badge classes for task status
const getTaskStatusBadgeClass = (status: string) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return classMap[status as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};
</script>
