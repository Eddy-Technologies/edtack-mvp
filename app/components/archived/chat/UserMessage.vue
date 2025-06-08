<template>
  <div class="flex items-start gap-x-4 p-4 rounded-lg">
    <UAvatar v-if="user?.avatarUrl" :src="user.avatarUrl" size="md" />

    <div v-else class="w-10 h-10 relative rounded-full border-4 border-primary-500">
      <UIcon
        name="i-heroicons-user-circle-16-solid"
        class="absolute -left-1 -top-1 w-10 h-10 text-primary"
      />
    </div>

    {{ content }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ content: string }>();

const { user } = useUserSession();
</script>
