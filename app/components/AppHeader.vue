<template>
  <div class="relative z-10 p-4 sm:p-8 bg-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <img src="/logo.png" class="w-[40px] sm:w-[50px] h-auto mr-3">
        <h1 class="text-gray-800 text-xl sm:text-2xl font-bold">Eddy</h1>
      </div>
      <div class="flex gap-4">
        <Button variant="primary" text="Login" @click="login" />
        <Button
          variant="ghost"
          class="border border-gray-300"
          text="Register for Free"
          @click="register"
        />
      </div>
    </div>
  </div>

  <LoginModal
    v-if="loginModalVisible"
    @close="loginModalVisible = false"
    @success="handleLoginSuccess"
    @register="register"
  />
  <RegisterModal
    v-if="registerModalVisible"
    @close="registerModalVisible = false"
    @success="handleRegisterSuccess"
    @login="login"
  />
</template>

<script setup>
import { ref } from 'vue';
import LoginModal from './login/LoginModal.vue';
import RegisterModal from './register/RegisterModal.vue';
import Button from '~/components/common/Button.vue';

const loggedIn = ref(false);
const loginModalVisible = ref(false);
const registerModalVisible = ref(false);

const login = () => {
  registerModalVisible.value = false;
  loginModalVisible.value = true;
};

const register = () => {
  loginModalVisible.value = false;
  registerModalVisible.value = true;
};

const handleLoginSuccess = () => {
  loggedIn.value = true;
  loginModalVisible.value = false;
};

const handleRegisterSuccess = () => {
  loggedIn.value = true;
  registerModalVisible.value = false;
};
</script>
