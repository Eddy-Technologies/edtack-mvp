<template>
  <div class="dashboard-family">
    <div class="family-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">Loading family members...</p>
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
          @clicked="loadFamily"
        />
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Family Management</h1>
            <p class="text-gray-600">
              {{ isParent ? 'Manage your children and family members' : 'View your family connections' }}
            </p>
          </div>
          
          <!-- Add Child Button (Parents Only) -->
          <Button
            v-if="isParent"
            variant="primary"
            text="Add Child"
            icon="i-lucide-user-plus"
            @clicked="showAddChildModal = true"
          />
        </div>

        <!-- Family Stats -->
        <div class="bg-white rounded-lg border p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-users" class="text-blue-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ familyMembers.length }}</p>
              <p class="text-sm text-gray-600">{{ isParent ? 'Children' : 'Family Members' }}</p>
            </div>
            
            <div v-if="isParent" class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-check-circle" class="text-green-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ activeChildren }}</p>
              <p class="text-sm text-gray-600">Active Children</p>
            </div>

            <div v-if="isParent" class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <UIcon name="i-lucide-clipboard-list" class="text-purple-600" size="24" />
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ totalTasks }}</p>
              <p class="text-sm text-gray-600">Active Tasks</p>
            </div>
          </div>
        </div>

        <!-- Children List -->
        <div class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ isParent ? 'Your Children' : 'Family Members' }}
            </h2>
          </div>

          <!-- Empty State -->
          <div v-if="familyMembers.length === 0" class="text-center py-12">
            <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
              <UIcon name="i-lucide-users" size="64" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ isParent ? 'No children added yet' : 'No family connections' }}
            </h3>
            <p class="text-gray-500 mb-6">
              {{ isParent ? 'Add your first child to start creating tasks and managing credits.' : 'You haven\'t been connected to any family members yet.' }}
            </p>
            <Button
              v-if="isParent"
              variant="primary"
              text="Add Your First Child"
              icon="i-lucide-user-plus"
              @clicked="showAddChildModal = true"
            />
          </div>

          <!-- Family Members List -->
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="member in familyMembers"
              :key="member.id"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <!-- Member Info -->
                <div class="flex items-start space-x-4">
                  <!-- Avatar -->
                  <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full flex-shrink-0">
                    <span class="text-blue-700 font-medium text-lg">
                      {{ getInitials(member.userDisplayFullName) }}
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ member.userDisplayFullName }}
                      </h3>
                      <span :class="getRoleBadgeClass(member.user_role)" class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ member.user_role.charAt(0).toUpperCase() + member.user_role.slice(1) }}
                      </span>
                      <span v-if="member.isActive" class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>

                    <p class="text-gray-600 mb-3">{{ member.email }}</p>

                    <!-- Stats -->
                    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div class="flex items-center space-x-1">
                        <UIcon name="i-lucide-calendar" size="16" />
                        <span>Joined {{ formatDate(member.created_at) }}</span>
                      </div>
                      
                      <div v-if="member.user_role === 'child'" class="flex items-center space-x-1">
                        <UIcon name="i-lucide-coins" size="16" />
                        <span>{{ formatCredits(member.credits || 0) }} credits</span>
                      </div>

                      <div v-if="member.user_role === 'child' && member.activeTasks" class="flex items-center space-x-1">
                        <UIcon name="i-lucide-clipboard-list" size="16" />
                        <span>{{ member.activeTasks }} active tasks</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div v-if="isParent" class="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary-gray"
                    text="View Profile"
                    size="sm"
                    @clicked="viewProfile(member)"
                  />
                  <Button
                    variant="danger"
                    text="Remove"
                    size="sm"
                    @clicked="removeMember(member)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Child Modal -->
    <AddChildModal
      :is-open="showAddChildModal"
      @close="showAddChildModal = false"
      @child-added="onChildAdded"
    />

    <!-- Remove Confirmation Modal -->
    <RemoveChildModal
      :is-open="showRemoveModal"
      :child="selectedMember"
      @close="showRemoveModal = false"
      @child-removed="onChildRemoved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../common/Button.vue';
import AddChildModal from './family/AddChildModal.vue';
import RemoveChildModal from './family/RemoveChildModal.vue';

// Reactive state
const familyMembers = ref<any[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isParent = ref(false);
const totalTasks = ref(0);

// Modal states
const showAddChildModal = ref(false);
const showRemoveModal = ref(false);
const selectedMember = ref<any>(null);

// Computed properties
const activeChildren = computed(() => {
  return familyMembers.value.filter(member => member.isActive).length;
});

// Functions
const loadFamily = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch('/api/family/list');

    if (response.success) {
      familyMembers.value = response.familyMembers || [];
      isParent.value = response.isParent || false;
      totalTasks.value = response.totalTasks || 0;
    } else {
      throw new Error('Failed to load family members');
    }
  } catch (err: any) {
    console.error('Failed to load family:', err);
    error.value = err.data?.message || 'Failed to load family members. Please try again.';
    familyMembers.value = [];
  } finally {
    isLoading.value = false;
  }
};

const viewProfile = (member: any) => {
  // Navigate to member profile or show details modal
  console.log('View profile for:', member);
};

const removeMember = (member: any) => {
  selectedMember.value = member;
  showRemoveModal.value = true;
};

const onChildAdded = () => {
  showAddChildModal.value = false;
  loadFamily();
};

const onChildRemoved = () => {
  showRemoveModal.value = false;
  loadFamily();
};

// Utility functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getRoleBadgeClass = (role: string) => {
  const classMap = {
    parent: 'bg-blue-100 text-blue-800',
    child: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800'
  };
  return classMap[role as keyof typeof classMap] || 'bg-gray-100 text-gray-800';
};

const formatCredits = (cents: number) => {
  return `${(cents / 100).toFixed(0)}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'today';
  if (diffDays === 2) return 'yesterday';
  if (diffDays <= 30) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

// Load family on mount
onMounted(() => {
  loadFamily();
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
</style>