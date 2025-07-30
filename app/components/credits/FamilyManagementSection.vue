<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div class="flex items-center mb-4">
      <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-2">
        <UIcon name="i-lucide-users-round" class="text-blue-700" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Family Management</h3>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
      <p class="text-gray-500">Loading family data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
        <UIcon name="i-lucide-user-round" class="text-blue-700" size="20" />
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" @click="loadFamilyData">
        Try Again
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Non-parent message -->
      <div v-if="!isParent" class="text-center py-8">
        <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <UIcon name="i-lucide-users-round" class="text-blue-700" size="20" />
        </div>
        <p class="text-gray-500 text-sm">Only parents can manage family members</p>
        <p class="text-gray-400 text-xs mt-1">Contact your parent to be added to their family</p>
      </div>

      <!-- Parent view -->
      <div v-else>
        <p class="text-gray-600 mb-6">Invite children to your family and manage their credit access</p>

        <!-- Add Child Section -->
        <div class="mb-8">
          <!-- Add Child Button -->
          <div v-if="!showAddChildForm" class="mb-4">
            <button
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
              @click="showAddChildForm = true"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Child
            </button>
          </div>

          <!-- Add Child Form -->
          <div v-if="showAddChildForm" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Add Child</h4>
              <button
                class="text-gray-400 hover:text-gray-600"
                @click="cancelAddChild"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Child Email Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Child's Email</label>
                <input
                  v-model="newChildEmail"
                  type="email"
                  placeholder="child@example.com"
                  class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="isVerifying"
                  @keyup.enter="handleVerifyEmail"
                >
                <p v-if="emailError" class="mt-2 text-sm text-red-600">{{ emailError }}</p>
              </div>

              <!-- Submit Button -->
              <Button
                :disabled="!newChildEmail || isVerifying"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                @click="handleVerifyEmail"
              >
                <div v-if="isVerifying" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                {{ isVerifying ? 'Checking Email...' : 'Check Email' }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Current Children -->
        <div v-if="children.length > 0" class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Current Children</h4>
          <div class="space-y-3">
            <div
              v-for="child in children"
              :key="child.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <UIcon name="i-lucide-user-round" class="text-blue-700" size="20" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ child.name }}</div>
                  <div class="text-sm text-gray-500">{{ child.email }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-gray-900">{{ child.balance }} credits</div>
                <div class="text-sm text-gray-500">{{ child.status }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Invitations -->
        <div v-if="pendingInvitations.length > 0" class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h4>
          <div class="space-y-3">
            <div
              v-for="invitation in pendingInvitations"
              :key="invitation.id"
              class="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                  <UIcon name="i-lucide-user-round" class="text-orange-700" size="20" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ invitation.childName }}</div>
                  <div class="text-sm text-gray-500">{{ invitation.childEmail }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-yellow-700">Pending</div>
                <div class="text-xs text-gray-500">{{ invitation.sentDate }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="children.length === 0 && pendingInvitations.length === 0" class="text-center py-8">
          <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <UIcon name="i-lucide-user-round" class="text-blue-700" size="20" />
          </div>
          <p class="text-gray-500">No children added yet</p>
          <p class="text-gray-400 text-sm mt-1">Use the form above to invite your first child</p>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <UIcon name="i-lucide-circle-plus" class="text-blue-700" size="20" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Confirm Add Child</h3>
        </div>

        <p class="text-gray-600 mb-4">
          We found a user account with this email. Do you want to add this child to your family?
        </p>

        <div class="bg-gray-50 rounded-lg p-3 mb-6">
          <div class="font-medium text-gray-900">{{ foundUser?.name }}</div>
          <div class="text-sm text-gray-500">{{ foundUser?.email }}</div>
        </div>

        <div class="flex space-x-3">
          <Button
            variant="secondary"
            :disabled="isInviting"
            @click="handleCancelConfirm"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            :loading="isInviting"
            :disabled="isInviting"
            @click="handleConfirmAddChild"
          >
            {{ isInviting ? 'Adding...' : 'Confirm' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Button from '../common/Button.vue';

// Use unified credit management - consume shared state
const {
  isParent,
  children: creditChildren,
  isLoading: creditLoading,
  error: creditError
} = useCredit();

// Transform credit children for family management display
const children = computed(() =>
  creditChildren.value.map((child) => ({
    id: child.userInfoId,
    name: child.name,
    email: child.email,
    balance: child.balanceInDollars,
    status: 'Active'
  }))
);

// Reactive state
const isLoading = computed(() => creditLoading.value);
const error = computed(() => creditError.value);
const isVerifying = ref(false);
const isInviting = ref(false);
const newChildEmail = ref('');
const emailError = ref('');
const showAddChildForm = ref(false);
const showConfirmModal = ref(false);
const foundUser = ref<{ name: string; email: string } | null>(null);

const pendingInvitations = ref<{
  id: string;
  childName: string;
  childEmail: string;
  sentDate: string;
}[]>([]);

const cancelAddChild = () => {
  showAddChildForm.value = false;
  newChildEmail.value = '';
  emailError.value = '';
};

const handleVerifyEmail = async () => {
  if (!newChildEmail.value) return;

  isVerifying.value = true;
  emailError.value = '';

  try {
    const response = await $fetch('/api/credits/verify-email', {
      method: 'POST',
      body: {
        email: newChildEmail.value
      }
    });

    if (response) {
      // API returns the email if valid, so we can proceed
      foundUser.value = {
        name: newChildEmail.value, // Use email as name since we don't get name back
        email: newChildEmail.value
      };
      showConfirmModal.value = true;
    } else {
      emailError.value = 'This email address does not exist in our system, is your own email, or is invalid. Please check the email and try again.';
    }
  } catch (error) {
    console.error('Failed to verify email:', error);
    emailError.value = 'Failed to verify email. Please try again.';
  } finally {
    isVerifying.value = false;
  }
};

const handleConfirmAddChild = async () => {
  if (!foundUser.value) return;

  isInviting.value = true;
  try {
    const response = await $fetch('/api/credits/add-child', {
      method: 'POST',
      body: {
        childEmail: foundUser.value.email
      }
    });

    if (response) {
      // API returns child details: { email, id, firstName, lastName }
      const childName = `${response.firstName} ${response.lastName}`;

      // Add to current children list
      children.value.unshift({
        id: response.id,
        name: childName,
        email: response.email,
        balance: 0,
        status: 'Active'
      });

      // Reset state
      showConfirmModal.value = false;
      showAddChildForm.value = false;
      newChildEmail.value = '';
      foundUser.value = null;

      alert(`Successfully added ${childName} to your family!`);
    } else {
      throw new Error('Failed to add child');
    }
  } catch (error) {
    console.error('Failed to add child:', error);
    alert('Failed to add child. Please try again.');
  } finally {
    isInviting.value = false;
  }
};

const handleCancelConfirm = () => {
  showConfirmModal.value = false;
  foundUser.value = null;
};

// No onMounted needed - consuming shared credit state from CreditsTab
</script>
