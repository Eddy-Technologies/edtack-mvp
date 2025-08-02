<template>
  <div
    :class="[
      'rounded-full cursor-pointer hover:bg-primary/90 flex items-center justify-center text-white font-semibold bg-primary',
      sizeClasses,
    ]"
    :title="`Welcome, ${user?.userDisplayFullName || 'User'}`"
    @click="$emit('click')"
  >
    {{ user?.userInitials || '?' }}
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMeStore } from '../../stores/me';

interface Props {
  size?: 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
});

defineEmits<{
  click: [];
}>();

const user = ref<ReturnType<typeof useMeStore> | null>(null);

onMounted(() => {
  user.value = useMeStore();
});

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
</script>
