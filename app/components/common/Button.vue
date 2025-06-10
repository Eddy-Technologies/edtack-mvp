<template>
  <UButton
    :color="color"
    :size="size"
    :variant="variant"
    :disabled="disabled"
    :class="computedClass"
    @click="handleClick"
  >
    <div class="flex items-center justify-center w-full h-full">
      <slot name="icon" />
      <span v-if="text" class="inline-block">{{ text }}</span>
    </div>
  </UButton>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  text?: string;
  route?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | string;
  variant?: 'primary' | 'secondary' | 'secondary-gray' | 'secondary-danger';
  extraClasses?: string; // Additional Tailwind classes (supports extra-classes in kebab-case)
  bold?: boolean;
  rounded?: boolean;
  border?: boolean;
  hover?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits(['clicked']);
const router = useRouter();

const handleClick = () => {
  if (props.disabled) return;
  emit('clicked');
  if (props.route !== undefined) router.push(props.route);
};

// Compute dynamic classes
const computedClass = computed(() => {
  const classes = [];

  // Base size classes
  let sizeClasses = 'px-4 py-2';
  if (props.size === 'sm') sizeClasses = 'px-3 py-1 text-sm';
  if (props.size === 'lg') sizeClasses = 'px-6 py-3 text-lg';

  // Variant styles
  if (props.variant === 'primary') classes.push(`${sizeClasses} bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors`);
  if (props.variant === 'secondary') classes.push(`${sizeClasses} text-primary border border-primary rounded-lg hover:bg-primary-50 transition-colors`);
  if (props.variant === 'secondary-gray') classes.push(`${sizeClasses} border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors`);
  if (props.variant === 'secondary-danger') classes.push(`${sizeClasses} text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors`);

  // Disabled state
  if (props.disabled) {
    classes.push('opacity-50 cursor-not-allowed');
  }

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
