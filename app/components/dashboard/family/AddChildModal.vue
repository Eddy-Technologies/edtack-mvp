<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Add Child to Family</h2>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="$emit('close')"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <!-- Tab Selection -->
        <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            :class="['px-3 py-2 rounded text-sm transition-colors flex-1', activeTab === 'existing' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
            @click="activeTab = 'existing'"
          >
            Link Existing User
          </button>
          <button
            :class="['px-3 py-2 rounded text-sm transition-colors flex-1', activeTab === 'invite' ? 'bg-white shadow-sm text-primary' : 'text-gray-600 hover:text-gray-900']"
            @click="activeTab = 'invite'"
          >
            Send Invite
          </button>
        </div>

        <!-- Link Existing User -->
        <div v-if="activeTab === 'existing'">
          <form class="space-y-4" @submit.prevent="linkExistingUser">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Child's Email Address *
              </label>
              <input
                v-model="existingUserEmail"
                type="email"
                required
                placeholder="child@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <p class="text-sm text-gray-500 mt-1">
                The child must already have an account in the system
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm">{{ error }}</p>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3 pt-4">
              <Button
                variant="secondary-gray"
                text="Cancel"
                :disabled="isSubmitting"
                @clicked="$emit('close')"
              />
              <Button
                type="submit"
                variant="primary"
                text="Link Child"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              />
            </div>
          </form>
        </div>

        <!-- Send Invite -->
        <div v-else-if="activeTab === 'invite'">
          <form class="space-y-4" @submit.prevent="sendInvite">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Child's Name *
              </label>
              <input
                v-model="inviteForm.name"
                type="text"
                required
                placeholder="Child's full name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                v-model="inviteForm.email"
                type="email"
                required
                placeholder="child@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                v-model="inviteForm.message"
                rows="3"
                placeholder="Hi! I'd like to invite you to join our family account..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm">{{ error }}</p>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3 pt-4">
              <Button
                variant="secondary-gray"
                text="Cancel"
                :disabled="isSubmitting"
                @clicked="$emit('close')"
              />
              <Button
                type="submit"
                variant="primary"
                text="Send Invite"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              />
            </div>
          </form>
        </div>

        <!-- Info Note -->
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <UIcon name="i-lucide-info" size="16" class="inline mr-1" />
            {{ activeTab === 'existing'
              ? 'The child will be immediately linked to your account and can start receiving tasks.'
              : 'An invitation email will be sent. The child must accept the invitation to join your family.'
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from '../../common/Button.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'child-added'): void;
}>();

// Form state
const activeTab = ref<'existing' | 'invite'>('existing');
const existingUserEmail = ref('');
const inviteForm = ref({
  name: '',
  email: '',
  message: ''
});

const isSubmitting = ref(false);
const error = ref<string | null>(null);

const linkExistingUser = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    const response = await $fetch('/api/family/link-child', {
      method: 'POST',
      body: {
        childEmail: existingUserEmail.value
      }
    });

    if (response.success) {
      // Reset form
      existingUserEmail.value = '';
      emit('child-added');
    } else {
      throw new Error(response.message || 'Failed to link child');
    }
  } catch (err: any) {
    console.error('Failed to link child:', err);
    error.value = err.data?.message || 'Failed to link child. Please check the email and try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const sendInvite = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    const response = await $fetch('/api/family/invite-child', {
      method: 'POST',
      body: {
        name: inviteForm.value.name,
        email: inviteForm.value.email,
        message: inviteForm.value.message || null
      }
    });

    if (response.success) {
      // Reset form
      inviteForm.value = {
        name: '',
        email: '',
        message: ''
      };
      emit('child-added');
    } else {
      throw new Error(response.message || 'Failed to send invite');
    }
  } catch (err: any) {
    console.error('Failed to send invite:', err);
    error.value = err.data?.message || 'Failed to send invite. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form when modal closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    existingUserEmail.value = '';
    inviteForm.value = {
      name: '',
      email: '',
      message: ''
    };
    error.value = null;
    activeTab.value = 'existing';
  }
});
</script>
