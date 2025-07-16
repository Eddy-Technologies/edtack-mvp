<template>
  <div class="relative z-20 p-4 sm:p-8 bg-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <img src="/logo.png" class="w-[40px] sm:w-[50px] h-auto mr-3">
        <h1 class="text-gray-800 text-xl sm:text-2xl font-bold">Eddy</h1>
      </div>
      <AuthenticationWidget
        @login-success="handleLoginSuccess"
        @register-success="handleRegisterSuccess"
        @logout="handleLogout"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthenticationWidget from './AuthenticationWidget.vue';

const handleLoginSuccess = () => {
  // Handle any additional actions after successful login
  // AuthenticationWidget already handles the modal closing
};

const handleRegisterSuccess = () => {
  // Handle any additional actions after successful registration
  // AuthenticationWidget already handles the modal closing
};

const handleLogout = () => {
  // Handle any additional actions after logout
  // AuthenticationWidget already handles the logout process
};
</script>
