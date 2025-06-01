<template>
  <UButton
    :color="color"
    :size="size"
    :variant="variant"
    :class="computedClass"
    @click="handleClick"
  >
    <slot name="icon" />
    <span class="inline-block">{{ text }}</span>
  </UButton>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  text: string;
  route: string;
  color?: string;
  size?: string;
  variant?: string;
  extraClasses?: string; // Additional Tailwind classes
  bold?: boolean;
  rounded?: boolean;
  border?: boolean;
  hover?: boolean;
}>();

const emit = defineEmits(['clicked']);
const router = useRouter();

const handleClick = () => {
  emit('clicked');
  router.push(props.route);
};

// Compute dynamic classes
const computedClass = computed(() => {
  const classes = [];

  if (props.bold) classes.push('font-bold');
  if (props.rounded) classes.push('rounded-lg');
  if (props.border) classes.push('border-2 border-black');
  if (props.color === 'white') {
    if (props.hover) classes.push('hover:bg-gray-200');
  } else {
    if (props.hover) classes.push('hover:bg-gray-800');
  }

  classes.push('justify-center', 'text-center', 'transition-colors', 'duration-300');

  if (props.extraClasses) classes.push(props.extraClasses);

  return classes.join(' ');
});
</script>

<style scoped></style>
