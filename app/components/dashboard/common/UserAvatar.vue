<template>
  <div
    :class="[
      'rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 flex items-center justify-center text-white font-semibold',
      sizeClasses,
      avatarColor
    ]"
    :title="`Welcome, ${currentUserDisplayName}`"
    @click="$emit('click')"
  >
    {{ userInitials }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeStore } from '../../../stores/me';
import { generateInitials, generateAvatarColor, getDisplayFullName } from '~/utils/avatarUtils';

interface Props {
  size?: 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
});

defineEmits<{
  click: [];
}>();

const meStore = useMeStore();
const { me: user } = storeToRefs(meStore);

// Size classes based on the size prop
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'large':
      return 'w-24 h-24 text-2xl';
    case 'default':
    default:
      return 'w-10 h-10 text-sm';
  }
});

// Generate user initials and avatar color
const userInitials = computed(() => {
  if (!user.value) return '';
  const { first_name, last_name, email } = user.value;
  return generateInitials(first_name, last_name, email);
});

const currentUserDisplayName = computed(() => {
  if (!user.value) return '';
  const { first_name, last_name, email } = user.value;
  return getDisplayFullName(first_name, last_name, email);
});

const avatarColor = computed(() => {
  if (!user.value) return 'bg-gray-500';

  const { first_name, last_name, email } = user.value;

  // Use full name for color generation, fallback to email
  const nameForColor = first_name && last_name ?
    `${first_name} ${last_name}` :
    first_name || last_name || email || '';

  return generateAvatarColor(nameForColor);
});
</script>
