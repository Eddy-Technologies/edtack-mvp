<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center mb-4">
        <div class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mr-3">
          <UIcon name="i-lucide-alert-triangle" class="text-red-600" size="20" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Remove Family Member</h3>
      </div>

      <p class="text-gray-600 mb-4">
        Are you sure you want to remove 
        <strong>{{ member?.userDisplayFullName || member?.email }}</strong> 
        from your family group? This action cannot be undone.
      </p>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
        <p class="text-sm text-yellow-800">
          <strong>Note:</strong> This will remove their access to shared family data and credit transfers.
        </p>
      </div>

      <div class="flex space-x-3">
        <Button
          variant="secondary"
          text="Cancel"
          :disabled="isLoading"
          @clicked="$emit('close')"
        />
        <Button
          variant="danger"
          text="Remove Member"
          :loading="isLoading"
          :disabled="isLoading"
          @clicked="handleRemove"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '../../common/Button.vue';

const props = defineProps<{
  isOpen: boolean;
  member: any;
}>();

const emit = defineEmits<{
  close: [];
  'member-removed': [];
}>();

// Reactive state
const isLoading = ref(false);

const handleRemove = async () => {
  if (!props.member) return;

  isLoading.value = true;

  try {
    const response = await $fetch('/api/family/remove-child', {
      method: 'POST',
      body: {
        childId: props.member.user_info_id || props.member.id
      }
    });

    if (response.success) {
      emit('member-removed');
    } else {
      throw new Error('Failed to remove member');
    }
  } catch (err: any) {
    console.error('Failed to remove member:', err);
    alert('Failed to remove member. Please try again.');
  } finally {
    isLoading.value = false;
  }
};
</script>