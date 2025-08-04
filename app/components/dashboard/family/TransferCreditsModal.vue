<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="max-w-lg w-full mx-4">
      <TransferCreditsForm
        :pre-selected-member="member"
        :parent-balance="parentBalance"
        :is-loading="isLoading"
        :show-cancel="true"
        @transfer="handleTransfer"
        @cancel="$emit('close')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import TransferCreditsForm from '~/components/credits/TransferCreditsForm.vue';

interface Member {
  userInfoId?: string;
  user_info_id?: string;
  id?: string;
  userDisplayFullName?: string;
  email: string;
}

const props = defineProps<{
  isOpen: boolean;
  member: Member | null;
  parentBalance: number;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  transfer: [{
    toUserInfoId: string;
    amount: number;
    note?: string;
    recipientName: string;
  }];
}>();

// Close modal when clicking outside or pressing escape
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        emit('close');
      }
    };

    document.addEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    };
  } else {
    document.body.style.overflow = '';
  }
});

const handleTransfer = (transferData: {
  toUserInfoId: string;
  amount: number;
  note?: string;
  recipientName: string;
}) => {
  emit('transfer', transferData);
};
</script>
