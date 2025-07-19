<template>
  <Modal :visible="true" @close="handleClose">
    <template #header>
      <h2 class="text-xl font-semibold text-center">Register for Eddy</h2>
    </template>

    <RegisterForm @success="handleRegister" />

    <template #footer>
      <div class="flex justify-around text-sm text-gray-600">
        <button class="hover:underline" @click="handleLogin">Login</button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue';
import RegisterForm from '@/components/register/RegisterForm.vue';

const emit = defineEmits(['close', 'success', 'login']);

const handleClose = () => {
  emit('close');
};

const handleRegister = (message?: string) => {
  emit('success', message);
};

const handleLogin = () => {
  emit('login');
};
</script>
