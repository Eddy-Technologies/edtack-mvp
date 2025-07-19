<template>
  <Modal :visible="true" @close="handleClose">
    <template #header>
      <h2 class="text-xl font-semibold text-center">Welcome to Eddy</h2>
    </template>

    <LoginForm :message="props.message" @success="handleLogin" />

    <template #footer>
      <div class="flex justify-around text-sm text-gray-600">
        <button class="hover:underline" @click="handleRegister">Sign Up</button>
        <button class="hover:underline">Forgot Password</button>
        <button class="hover:underline">Contact Us</button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue';
import LoginForm from '@/components/login/LoginForm.vue';

interface Props {
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: ''
});

const emit = defineEmits(['close', 'success', 'register']);

const handleClose = () => {
  emit('close');
};

const handleLogin = () => {
  // Login was successful, emit success event
  emit('success');

  // TODO: Redirect to dashboard or appropriate page after login
  // TODO: Show success message/toast
  // TODO: Update global auth state

  // Close modal
  handleClose();
};

const handleRegister = () => {
  emit('register');
};
</script>
