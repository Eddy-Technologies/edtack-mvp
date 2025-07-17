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
import { storeToRefs } from 'pinia';
import { useMeStore } from '../../stores/me';
import { getDisplayFullName } from '../../utils/avatarUtils';
import UserAvatar from './common/UserAvatar.vue';
import { USER_ROLE } from '~/constants/User';

const meStore = useMeStore();
const { me: user } = storeToRefs(meStore);

interface Props {
  showEditButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: false,
});

const name = computed(() => {
  if (!user.value) return '';
  const { first_name, last_name, email } = user.value;
  return getDisplayFullName(first_name, last_name, email);
});

const email = computed(() => {
  if (!user.value) return '';
  return user.value.email || 'user@example.com';
});

const roleDescription = computed(() => {
  if (!user.value) return;
  const role = user.value.user_role === USER_ROLE.PARENT ? 'Parent' : 'Student';
  return `${role} account`;

  // TODO: include grade for student
});
</script>
