<template>
  <div class="bg-white rounded-xl shadow-sm border p-6">
    <div class="flex items-center space-x-6">
      <div class="relative">
        <UserAvatar size="large" />
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">{{ name }}</h1>
        <p class="text-gray-600">{{ email }}</p>
        <p class="text-sm text-gray-500">{{ roleDescription }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMeStore } from '../../../stores/me';
import UserAvatar from '~/components/common/UserAvatar.vue';
import { getDisplayFullName } from '~/utils/avatarUtils';
import { USER_ROLE } from '~/constants/User';

const user = useMeStore();

interface Props {
  showEditButton?: boolean;
}

withDefaults(defineProps<Props>(), {
  showEditButton: false,
});

const name = computed(() => {
  if (!user) return '';
  const { first_name, last_name, email } = user;
  return getDisplayFullName(first_name, last_name, email);
});

const email = computed(() => {
  if (!user) return '';
  return user.email || 'user@example.com';
});

const roleDescription = computed(() => {
  if (!user) return;
  const role = user.user_role === USER_ROLE.PARENT ? 'Parent' : 'Student';
  return `${role} account`;

  // TODO: include grade for student
});
</script>
